const mongoose = require("mongoose");
const crypto = require("crypto");

const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const razorpay = require("../config/razorpay");

// ======================================================
// HELPER — GET LOGGED-IN USER ID
// ======================================================

const getUserId = (req) => {
  return req.user.id || req.user.userId || req.user._id;
};

// ======================================================
// CREATE PAYMENT ORDER
// POST /orders/create-payment-order
// ======================================================

const createPaymentOrder = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ==============================================
    // SHIPPING ADDRESS
    // ==============================================

    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } =
      shippingAddress;

    // ==============================================
    // BASIC SERVER VALIDATION
    // ==============================================

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping fields are required",
      });
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain 10 digits",
      });
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain 6 digits",
      });
    }

    // ==============================================
    // LOAD CUSTOMER + CART
    // ==============================================

    const customer = await Customer.findById(userId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ==============================================
    // LOAD LATEST PRODUCT DATA
    // ==============================================

    const orderItems = [];

    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);

      // Product deleted
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available",
        });
      }

      // ==========================================
      // FINAL STOCK VALIDATION
      // ==========================================

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${product.name}. ` +
            `Only ${product.stock} units available.`,
        });
      }

      // ==========================================
      // SERVER-SIDE TOTAL
      // ==========================================

      const itemTotal = product.price * cartItem.quantity;

      totalAmount += itemTotal;

      // ==========================================
      // ORDER SNAPSHOT
      // ==========================================

      orderItems.push({
        product: product._id,

        name: product.name,

        price: product.price,

        quantity: cartItem.quantity,

        image: product.image,
      });
    }

    // ==============================================
    // CREATE SHOPKART ORDER
    // ==============================================

    const order = await Order.create({
      user: userId,

      items: orderItems,

      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },

      totalAmount,

      paymentStatus: "PENDING",

      status: "PENDING_PAYMENT",
    });

    // ==============================================
    // CREATE RAZORPAY ORDER
    // ==============================================

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),

      currency: "INR",

      receipt: order._id.toString(),
    });

    // ==============================================
    // SAVE RAZORPAY ORDER ID
    // ==============================================

    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    // ==============================================
    // SEND SAFE DATA TO FRONTEND
    // ==============================================

    return res.status(201).json({
      success: true,

      shopKartOrderId: order._id,

      razorpayOrderId: razorpayOrder.id,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

// ======================================================
// VERIFY PAYMENT
// POST /orders/verify-payment
// ======================================================

const verifyPayment = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ==============================================
    // VALIDATE REQUEST
    // ==============================================

    if (
      !shopKartOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    // ==============================================
    // VALIDATE ORDER ID
    // ==============================================

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ==============================================
    // LOAD ORDER
    // ==============================================

    const order = await Order.findById(shopKartOrderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==============================================
    // OWNERSHIP CHECK
    // ==============================================

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to verify this order",
      });
    }

    // ==============================================
    // VERIFY RAZORPAY ORDER ID
    // ==============================================

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID mismatch",
      });
    }

    // ==============================================
    // CREATE SIGNATURE
    // ==============================================

    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // ==============================================
    // COMPARE SIGNATURE
    // ==============================================

    const signatureMatches = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );

    if (!signatureMatches) {
      order.paymentStatus = "FAILED";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // ==============================================
    // PAYMENT SUCCESS
    // ==============================================

    order.paymentStatus = "PAID";

    order.status = "PLACED";

    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    // ==============================================
    // CLEAR CART ONLY AFTER VERIFICATION
    // ==============================================

    const customer = await Customer.findById(userId);

    if (customer) {
      customer.cart = [];

      await customer.save();
    }

    // ==============================================
    // SUCCESS RESPONSE
    // ==============================================

    return res.status(200).json({
      success: true,

      message: "Payment verified and order placed",

      order: {
        _id: order._id,

        totalAmount: order.totalAmount,

        status: order.status,

        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// ======================================================
// GET MY ORDERS
// GET /orders
// ======================================================

const getMyOrders = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const orders = await Order.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .populate("items.product", "name image category");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// ======================================================
// GET SINGLE ORDER
// GET /orders/:id
// ======================================================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = getUserId(req);

    // ==============================================
    // VALIDATE ORDER ID
    // ==============================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ==============================================
    // FIND USER'S ORDER ONLY
    // ==============================================

    const order = await Order.findOne({
      _id: id,
      user: userId,
    }).populate("items.product", "name image category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
};

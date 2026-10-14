const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ======================================================
// ADD PRODUCT TO CART
// POST /cart/:productId
// ======================================================

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Get logged-in user from JWT middleware
    const userId = req.user.id || req.user.userId || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check customer
    const customer = await Customer.findById(userId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Find product in cart
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId,
    );

    // ==========================================
    // PRODUCT ALREADY IN CART
    // ==========================================

    if (cartItem) {
      const newQuantity = cartItem.quantity + 1;

      // Stock validation
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available`,
        });
      }

      cartItem.quantity = newQuantity;
    }

    // ==========================================
    // NEW PRODUCT
    // ==========================================
    else {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock",
        });
      }

      customer.cart.push({
        product: product._id,
        quantity: 1,
      });
    }

    await customer.save();

    // Return updated cart
    const updatedCustomer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

// ======================================================
// GET CART
// GET /cart
// ======================================================

const getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const customer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// ======================================================
// UPDATE CART QUANTITY
// PATCH /cart/:productId
// ======================================================

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate quantity
    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const userId = req.user.id || req.user.userId || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Stock validation
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available`,
      });
    }

    // Find customer
    const customer = await Customer.findById(userId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Find cart item
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId,
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // Update quantity
    cartItem.quantity = quantity;

    await customer.save();

    // Populate updated cart
    const updatedCustomer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

// ======================================================
// REMOVE PRODUCT FROM CART
// DELETE /cart/:productId
// ======================================================

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const userId = req.user.id || req.user.userId || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const customer = await Customer.findById(userId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // Remove cart item
    customer.cart.splice(index, 1);

    await customer.save();

    // Populate updated cart
    const updatedCustomer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name description price category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCustomer.cart,
    });
  } catch (error) {
    console.error("Remove cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};

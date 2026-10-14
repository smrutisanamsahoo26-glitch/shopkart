import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { useCart } from "../context/CartContext";

function Checkout() {
  const navigate = useNavigate();

  const { cartItems, subtotal, totalItems, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [serverError, setServerError] = useState("");

  // ==============================================
  // HANDLE INPUT
  // ==============================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  // ==============================================
  // VALIDATE FORM
  // ==============================================

  const validateForm = () => {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = "Phone must contain 10 digits.";
    }

    if (!form.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required.";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!form.state.trim()) {
      newErrors.state = "State is required.";
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      newErrors.pincode = "Pincode must contain 6 digits.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ==============================================
  // LOAD RAZORPAY
  // ==============================================

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // ==============================================
  // START CHECKOUT
  // ==============================================

  const handlePlaceOrder = async () => {
    setServerError("");

    // Do not continue if cart is empty
    if (cartItems.length === 0) {
      setServerError("Your cart is empty.");
      return;
    }

    // Client validation
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // ======================================
      // LOAD RAZORPAY
      // ======================================

      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        setServerError("Unable to load Razorpay Checkout.");
        return;
      }

      // ======================================
      // CREATE PAYMENT ORDER
      // ======================================

      const response = await api.post("/orders/create-payment-order", {
        shippingAddress: {
          fullName: form.fullName.trim(),

          phone: form.phone.trim(),

          addressLine1: form.addressLine1.trim(),

          city: form.city.trim(),

          state: form.state.trim(),

          pincode: form.pincode.trim(),
        },
      });

      const data = response.data;

      // ======================================
      // RAZORPAY OPTIONS
      // ======================================

      const options = {
        key: data.key,

        amount: data.amount,

        currency: data.currency,

        name: "ShopKart",

        description: "ShopKart Order",

        order_id: data.razorpayOrderId,

        prefill: {
          name: form.fullName,

          contact: form.phone,
        },

        handler: async function (paymentResponse) {
          try {
            setLoading(true);

            // ==================================
            // VERIFY PAYMENT ON BACKEND
            // ==================================

            const verifyResponse = await api.post("/orders/verify-payment", {
              shopKartOrderId: data.shopKartOrderId,

              razorpay_order_id: paymentResponse.razorpay_order_id,

              razorpay_payment_id: paymentResponse.razorpay_payment_id,

              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              // Clear React cart
              clearCart();

              // Go to success page
              navigate(`/order-success/${data.shopKartOrderId}`);
            }
          } catch (error) {
            console.error("Payment verification error:", error);

            setServerError(
              error.response?.data?.message || "Payment verification failed.",
            );
          } finally {
            setLoading(false);
          }
        },
      };

      // ======================================
      // CREATE RAZORPAY OBJECT
      // ======================================

      const paymentObject = new window.Razorpay(options);

      // ======================================
      // PAYMENT FAILED
      // ======================================

      paymentObject.on("payment.failed", function (response) {
        console.error("Payment failed:", response);

        setServerError(
          "Payment failed. Your cart has not been cleared. Please try again.",
        );

        setLoading(false);
      });

      // ======================================
      // OPEN RAZORPAY
      // ======================================

      paymentObject.open();
    } catch (error) {
      console.error("Checkout error:", error);

      setServerError(
        error.response?.data?.message || "Unable to start checkout.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================================
  // EMPTY CART
  // ==============================================

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h1>Your cart is empty</h1>

        <button className="details-btn" onClick={() => navigate("/products")}>
          Browse Products
        </button>
      </div>
    );
  }

  // ==============================================
  // UI
  // ==============================================

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {serverError && <div className="checkout-error">{serverError}</div>}

      <div className="checkout-layout">
        {/* =================================
                    SHIPPING FORM
                ================================= */}

        <div className="checkout-form">
          <h2>Shipping Details</h2>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />

            {errors.fullName && (
              <p className="field-error">{errors.fullName}</p>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
            />

            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>

          <div className="form-group">
            <label>Address</label>

            <textarea
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
            />

            {errors.addressLine1 && (
              <p className="field-error">{errors.addressLine1}</p>
            )}
          </div>

          <div className="form-group">
            <label>City</label>

            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
            />

            {errors.city && <p className="field-error">{errors.city}</p>}
          </div>

          <div className="form-group">
            <label>State</label>

            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
            />

            {errors.state && <p className="field-error">{errors.state}</p>}
          </div>

          <div className="form-group">
            <label>Pincode</label>

            <input
              type="text"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              maxLength={6}
            />

            {errors.pincode && <p className="field-error">{errors.pincode}</p>}
          </div>
        </div>

        {/* =================================
                    ORDER SUMMARY
                ================================= */}

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div className="checkout-item" key={item.product._id}>
              <div>
                <strong>{item.product.name}</strong>

                <p>× {item.quantity}</p>
              </div>

              <span>
                ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ))}

          <hr />

          <div className="summary-row">
            <span>Total Items</span>

            <span>{totalItems}</span>
          </div>

          <div className="summary-total">
            <span>Total</span>

            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

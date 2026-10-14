const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} = require("../controllers/order.controller");

const protect = require("../middlewares/auth.middleware");

const router = express.Router();

// Create ShopKart pending order + Razorpay order
router.post("/create-payment-order", protect, createPaymentOrder);

// Verify Razorpay payment
router.post("/verify-payment", protect, verifyPayment);

// Get current user's orders
router.get("/", protect, getMyOrders);

// Get one order belonging to current user
router.get("/:id", protect, getOrderById);

module.exports = router;

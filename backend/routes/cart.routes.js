const express = require("express");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

const protect = require("../middlewares/auth.middleware");

const router = express.Router();

// Add product / increase quantity
router.post("/:productId", protect, addToCart);

// Get current user's cart
router.get("/", protect, getCart);

// Update quantity
router.patch("/:productId", protect, updateCartQuantity);

// Remove product
router.delete("/:productId", protect, removeFromCart);

module.exports = router;

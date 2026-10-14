const express = require("express");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

const protect = require("../middlewares/auth.middleware");

const router = express.Router();

// Add product
router.post("/:productId", protect, addToWishlist);

// Get current user's wishlist
router.get("/", protect, getWishlist);

// Remove product
router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;

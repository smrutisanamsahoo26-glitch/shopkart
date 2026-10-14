const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ==========================================
// ADD PRODUCT TO WISHLIST
// POST /wishlist/:productId
// ==========================================

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // ----------------------------------
    // Validate Product ID
    // ----------------------------------

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // ----------------------------------
    // Get authenticated user's ID
    // ----------------------------------

    const userId = req.user.id || req.user.userId || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ----------------------------------
    // Check whether product exists
    // ----------------------------------

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ----------------------------------
    // Find current customer
    // ----------------------------------

    const customer = await Customer.findById(userId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ----------------------------------
    // Prevent duplicate wishlist entry
    // ----------------------------------

    const alreadyExists = customer.wishlist.some(
      (id) => id.toString() === productId,
    );

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // ----------------------------------
    // Add product reference
    // ----------------------------------

    customer.wishlist.push(product._id);

    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Add wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
    });
  }
};

// ==========================================
// GET CURRENT USER'S WISHLIST
// GET /wishlist
// ==========================================

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const customer = await Customer.findById(userId).populate({
      path: "wishlist",
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
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// DELETE /wishlist/:productId
// ==========================================

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // ----------------------------------
    // Validate Product ID
    // ----------------------------------

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

    // ----------------------------------
    // Check whether product exists
    // ----------------------------------

    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId,
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // ----------------------------------
    // Remove reference
    // ----------------------------------

    customer.wishlist.splice(index, 1);

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};

const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
} = require("../controllers/product.controller");

const router = express.Router();

// POST /products
router.post("/", createProduct);

// GET /products
router.get("/", getProducts);

// GET /products/:id
router.get("/:id", getProductById);

module.exports = router;

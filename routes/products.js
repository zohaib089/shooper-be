const express = require("express");
const router = express.Router();
const productsControllers = require("../controllers/products");
// @route GET api/products
// @desc Get all products
// @access Public
router.get("/", (req, res) => {
  res.send("Get all products");
});
// @route GET api/products/counts
// @desc Get product counts
// @access Public
router.get("/counts", productsControllers.getProuctsCount);
// @route POST api/products
// @desc Create a product
// @access Public
router.post("/", (req, res) => {
  res.send("Create a product");
});
// @route GET api/products/:id
// @desc Get product by id
// @access Public
router.get("/:id", productsControllers.getProductDetail);
// @route DELETE api/products/:id
// @desc Delete a product
// @access Public
router.delete("/:id", (req, res) => {
  id = req.params.productId;

  res.send(`Product ID: ${id}`);
});
// @route PUT api/products/:id
// @desc Update a product
// @access Public
router.put("/:id", (req, res) => {
  id = req.params.productId;
  res.send(`Product ID: ${id}`);
});

module.exports = router;

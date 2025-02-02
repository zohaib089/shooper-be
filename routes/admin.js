const express = require("express");
const router = express.Router();
const { getUsersCount, deleteUser } = require("../controllers/admin/users");
const {
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/admin/categories");
const {
  getProductsCount,
  addProduct,
  editProduct,
  deleteProductImages,
  deleteProduct,
  getProducts,
} = require("../controllers/admin/products");
const {
  getOrders,
  getOrdersCount,
  deleteOrder,
  changeOrderStatus,
} = require("../controllers/admin/orders");
//USERS
router.get("/users/count", getUsersCount);
router.delete("/users/:id", deleteUser);

//CATEGORIES;
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

//PRODUCTS
router.get("/products/count", getProductsCount);
router.get("/products", getProducts);
router.post("/products", addProduct);
router.put("/products/:id", editProduct);
router.delete("/products/:id/images", deleteProductImages);
router.delete("/products/:id", deleteProduct);

//ORDERS
router.get("/orders", getOrders);
router.get("/orders/count", getOrdersCount);
router.put("/orders/:id", changeOrderStatus);
router.put("/orders/:id", deleteOrder);
module.exports = router;

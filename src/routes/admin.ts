import express from "express";

const router = express.Router();
import { getUsersCount, deleteUser } from "../controllers/admin/users";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/admin/categories";
import {
  getProductsCount,
  addProduct,
  editProduct,
  deleteProductImages,
  deleteProduct,
  getProducts,
} from "../controllers/admin/products";
import {
  getOrders,
  getOrdersCount,
  deleteOrder,
  changeOrderStatus,
} from "../controllers/admin/orders";

//USERS
router.get("/users/count", getUsersCount);
router.delete("/users/:id", deleteUser);

//CATEGORIES
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

export default router;

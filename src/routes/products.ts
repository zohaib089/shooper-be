import express, { Router } from "express";
import {
  getProducts,
  searchProducts,
  getProductById,
} from "../controllers/products";
import { leaveReview, getProductReviews } from "../controllers/reviews";

const router: Router = express.Router();
router.get("/", getProducts);
router.get("/search", searchProducts);

router.get("/:id", getProductById);
router.post("/:id/reviews", leaveReview);
router.get("/:id/reviews", getProductReviews);
export default router;

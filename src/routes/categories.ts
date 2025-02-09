import express, { Router } from "express";
import { getCategories, getCategoryById } from "../controllers/category";

const router: Router = express.Router();
router.get("/", getCategories);
router.get("/:id", getCategoryById);

export default router;

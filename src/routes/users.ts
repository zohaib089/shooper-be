import express, { Router } from "express";
import { getUsers, getUserById, updateUser } from "../controllers/users";

const router: Router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

export default router;

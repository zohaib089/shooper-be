import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
  verifyToken,
} from "../controllers/auth";

const router = Router();

// Validation middleware types
const validateUser = [
  body("name").not().isEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isStrongPassword()
    .withMessage(
      "Password must contain atleast one uppercase,one lowercase, one symbol."
    ),
  body("phone")
    .isMobilePhone("any")
    .withMessage("Please enter a valid phone number"),
];

const validatePassword = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isStrongPassword()
    .withMessage(
      "Password must contain atleast one uppercase,one lowercase, one symbol."
    ),
];

/**
 * @route POST /register
 * @desc Register user
 * @access Public
 */
router.post("/register", validateUser, register);

/**
 * @route POST /login
 * @desc Login user / Returning JWT Token
 * @access Public
 */
router.post("/login", login);

/**
 * @route GET /verify-token
 * @desc Verify JWT Token
 * @access Public
 */
router.get("/verify-token", verifyToken);

/**
 * @route POST /logout
 * @desc Logout user
 * @access Public
 */
router.post("/logout", logout);

/**
 * @route POST /forgot-password
 * @desc Password Recovery
 * @access Public
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route POST /verify-otp
 * @desc Verify OTP
 * @access Public
 */
router.post("/verify-otp", verifyPasswordResetOTP);

/**
 * @route POST /reset-password
 * @desc Reset Password
 * @access Public
 */
router.post("/reset-password", validatePassword, resetPassword);

export default router;

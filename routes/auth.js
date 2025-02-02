const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
  verifyToken,
} = require("../controllers/auth");

const { body } = require("express-validator");

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
// @route POST
// @desc Register user
// @access Public
router.post("/register", validateUser, register);

// @route POST
// @desc Login user / Returning JWT Token
// @access Public
router.post("/login", login);

// @route GET
// @desc Verify JWT Token
// @access Public
router.get("/verify-token", verifyToken);

// @route POST
// @desc Login user / Returning JWT Token
// @access Public
router.post("/logout", logout);
// @route POST
// @desc Password Recovery
// @access Public
router.post("/forgot-password", forgotPassword);
// @route POST
// @desc verifty OTP
// @access Public
router.post("/verify-otp", verifyPasswordResetOTP);
// @route POST
// @desc verifty OTP
// @access Public
router.post("/reset-password", validatePassword, resetPassword);

module.exports = router;

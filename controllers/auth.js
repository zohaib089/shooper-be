const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const { Token } = require("../models/token");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { json } = require("body-parser");
const mailSender = require("../helpers/email_sender");

exports.register = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors
        .array()
        .map((err) => ({ field: err.path, message: err.msg })),
    });
  }

  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    const user = new User({ ...req.body, passwordHash: hashedPassword });
    await user.save();

    if (!user) {
      return res.status(500).json({
        type: "internal server error",
        message: "Could not create a new user",
      });
    }

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    if (error.message.includes("email_1 dup key")) {
      return res.status(409).json({
        type: "Authentication Error",
        message: "User with this Email already exists",
      });
    }

    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Check your email and try again." });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const tokenData = { id: user.id, isAdmin: user.isAdmin };
    const accessToken = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
    });
    const refreshToken = jwt.sign(tokenData, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "60d",
    });

    await Token.findOneAndUpdate(
      { userId: user.id },
      { accessToken, refreshToken },
      { upsert: true }
    );

    user.passwordHash = undefined;
    return res.json({ ...user._doc, accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.verifyToken = async function (req, res) {
  try {
    let accessToken = req.headers.authorization;
    if (!accessToken) return res, json(false);
    accessToken = accessToken.replace("Bearer ", "").trim();
    const token = await Token.findOne({ accessToken });
    if (!token) return res.json(false);
    const tokenData = jwt.decode(token.refreshToken);
    const user = await User.findById(tokenData.id);
    if (!user) return res.json(false);
    const isValid = jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!isValid) return res.json(false);
    return res.json(true);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.forgotPassword = async function (req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User with this email does NOT exists!",
      });
    }
    const otp = Math.floor(1000 * Math.random() * 9000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 600000;

    await user.save();

    const response = await mailSender.sendMail(
      email,
      "Password Rest OTP",
      `Your OTP for password reset is: ${otp}`
    );
    return res.status(200).json({
      message: response,
    });
  } catch (error) {
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.verifyPasswordResetOTP = async function (req, res) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User with this email does NOT exists!",
      });
    }
    if (
      user.resetPasswordOtp !== +otp ||
      Date.now() > user.resetPasswordOtpExpires
    ) {
      return res.status(401).json({
        message: "Invalid or Expired OTP",
      });
    }
    user.resetPasswordOtp = 1;
    user.resetPasswordOtpExpires = undefined;
    await user.save();
    return res.status(200).json({
      message: "OTP Verified",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.resetPassword = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors
        .array()
        .map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User with this email does NOT exists!",
      });
    }
    if (user.resetPasswordOtp !== 1) {
      return res.status(401).json({
        message: "Confirm OTP before resetting password. ",
      });
    }
    user.passwordHash = bcrypt.hashSync(newPassword, 8);
    user.resetPasswordOtp = undefined;
    await user.save();
    return res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.logout = async function (req, res) {};

import { validationResult } from "express-validator";
import { User } from "../models/user";
import { Token } from "../models/token";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendMail } from "../helpers/email_sender";

export const register = async function (
  req: Request,
  res: Response
): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err) => ({ message: err.msg })),
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
  } catch (error: any) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({
        type: "Authentication Error",
        message: "User with this Email already exists",
      });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

export const login = async function (
  req: Request,
  res: Response
): Promise<Response> {
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
    const accessToken = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "24h",
    });
    const refreshToken = jwt.sign(
      tokenData,
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "60d",
      }
    );

    // Save tokens to Token collection
    await Token.findOneAndUpdate(
      { userId: user.id },
      { accessToken, refreshToken },
      { upsert: true, new: true }
    );

    const userObject = user.toObject();
    delete (userObject as any).passwordHash;
    return res.json({ ...userObject, accessToken, refreshToken });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

export const verifyToken = async function (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    let accessToken = req.headers.authorization;
    if (!accessToken) return res.json(false);
    accessToken = accessToken.replace("Bearer ", "").trim();
    const token = await Token.findOne({ accessToken });
    if (!token) return res.json(false);
    const tokenData = jwt.decode(token.refreshToken) as jwt.JwtPayload;
    const user = await User.findById(tokenData.id);
    if (!user) return res.json(false);
    const isValid = jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    );
    if (!isValid) return res.json(false);
    return res.json(true);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

export const forgotPassword = async function (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User with this email does NOT exists!",
      });
    }
    const otp = Math.floor(1000 + Math.random() * 9000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 600000);

    await user.save();

    const response = await sendMail(
      email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}`
    );
    return res.status(200).json({
      message: response,
    });
  } catch (error: any) {
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

export const verifyPasswordResetOTP = async function (
  req: Request,
  res: Response
): Promise<Response> {
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
      (user.resetPasswordOtpExpires &&
        Date.now() > user.resetPasswordOtpExpires.getTime())
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
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

export const resetPassword = async function (
  req: Request,
  res: Response
): Promise<Response> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err) => ({ message: err.msg })),
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
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

export const logout = async function (
  req: Request,
  res: Response
): Promise<Response> {
  try {
    let accessToken = req.headers.authorization;
    if (!accessToken) {
      return res.status(401).json({ message: "No token provided" });
    }
    accessToken = accessToken.replace("Bearer ", "").trim();
    await Token.findOneAndDelete({ accessToken });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

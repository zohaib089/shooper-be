import { Request, Response } from "express";
import { User, IUser } from "../models/user";

export const getUsers = async (
  _: Request,
  res: Response
): Promise<Response> => {
  try {
    const users: IUser[] = await User.find().select("name email id isAdmin");
    if (!users) {
      console.log("Not Found");
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json(users);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user: IUser | null = await User.findById(req.params.id).select(
      "-passwordHash -resetPasswordOtp -resetPasswordOtpExpires -cart"
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json(user);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      name,
      email,
      phone,
    }: { name: string; email: string; phone: string } = req.body;
    const user: IUser | null = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    user.passwordHash = "";
    user.cart = [];
    return res.status(200).json(user);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

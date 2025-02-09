import { User } from "../../models/user";
import { Order } from "../../models/order";
import { OrderItem } from "../../models/order_item";
import { CartProduct } from "../../models/cart_product";
import { Token } from "../../models/token";
import { Request, Response } from "express";

export const getUsersCount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userCount = await User.countDocuments();
    if (!userCount) {
      return res.status(500).json({ message: "Could not get user count" });
    }
    return res.status(200).json(userCount);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const orders = await Order.find({ user: userId });
    const orderItemsIds = orders.map((order) => order.orderItems);
    await Order.deleteMany({ user: userId });
    await OrderItem.deleteMany({ _id: { $in: orderItemsIds } });
    await CartProduct.deleteMany({ _id: { $in: user.cart } });
    await User.findByIdAndUpdate(userId, {
      $pull: { cart: { $exists: true } },
    });
    await Token.deleteOne({ userId: userId });
    await User.deleteOne({ _id: userId });
    // await Review.deleteMany({ user: userId });
    return res.status(204).json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

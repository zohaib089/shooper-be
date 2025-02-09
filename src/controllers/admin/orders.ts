import { Request, Response } from "express";
import { Order, OrderStatus } from "../../models/order";
import { Product } from "../../models/product";
export const getOrders = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const orders = await Order.find()
      .select("-statusHistory")
      .populate("user", "name email")
      .sort({ dateOrdered: -1 })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          select: "name",
          populate: {
            path: "category",
            select: "name",
          },
        },
      });
    console.log(orders);
    if (!orders) {
      return res.status(404).json({ message: "Orders not found" });
    }
    return res.json(orders);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const getOrdersCount = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const count = await Order.countDocuments();
    if (!count) {
      return res.status(500).json({
        message: "Could not count orders!",
      });
    }
    return res.json({
      count,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const changeOrderStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const orderId: string = req.params.id;
    const { status } = req.body;
    // Fetch the current order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check the current status and the new status
    const currentStatus: string = order.status;
    if (currentStatus === "pending" && status === "delivered") {
      return res.status(400).json({
        message: "Order cannot be changed directly from pending to delivered",
      });
    }
    if (!order.statusHistory.includes(order.status)) {
      order.statusHistory.push(order.status);
    }
    // Update the status
    order.status = status;
    await order.save();

    return res.status(200).json(order);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const orderId: string = req.params.id;
    // Fetch the current order
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    for (const orderItemId of order.orderItems) {
      await Order.findByIdAndDelete(orderItemId);
    }
    return res.status(204).end();
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

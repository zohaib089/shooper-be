import { Schema, model, Document, Types } from "mongoose";
export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Shipped = "Shipped",
  OutForDelivery = "out-for-delivery",
  Delivered = "Delivered",
  Cancelled = "cancelled",
  Refunded = "refunded",
  OnHold = "on-hold",
  Expired = "expired",
  Failed = "failed",
  PartialRefund = "partial-refund",
}
interface IOrder extends Document {
  orderItems: Types.ObjectId[];
  shippingAddress: string;
  city: string;
  postalCode?: string;
  country: string;
  phone: string;
  paymenyId?: string;
  status: OrderStatus;
  statusHistory: OrderStatus[];
  totalPrice?: number;
  user?: Types.ObjectId;
  dateOrdered: Date;
}

const orderSchema = new Schema<IOrder>({
  orderItems: [
    {
      type: Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  paymenyId: String,
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Pending,
    required: true,
  },
  statusHistory: {
    type: [String],
    enum: Object.values(OrderStatus),
    default: [OrderStatus.Pending],
    required: true,
  },
  totalPrice: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

export const Order = model<IOrder>("Order", orderSchema);

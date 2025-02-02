const { Schema, model } = require("mongoose");

const orderSchema = Schema({
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
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "out-for-delivery",
      "Delivered",
      "cancelled",
      "refunded",
      "on-hold",
      "expired",
      "failed",
      "partial-refund",
    ],
    default: "Pending",
    required: true,
  },
  statusHistory: {
    type: [String],
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "out-for-delivery",
      "Delivered",
      "cancelled",
      "refunded",
      "on-hold",
      "expired",
      "failed",
      "partial-refund",
    ],
    default: ["Pending"],
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
exports.Order = model("Order", orderSchema);

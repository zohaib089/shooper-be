import { Schema, model, Document } from "mongoose";

interface IOrderItem extends Document {
  product: Schema.Types.ObjectId;
  productName: string;
  productImage: string;
  productPrice: string;
  quantity: number;
  selectedSize?: string;
  selectedColour?: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    required: true,
  },
  productPrice: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  selectedSize: String,
  selectedColour: String,
});

orderItemSchema.set("toObject", { virtuals: true });
orderItemSchema.set("toJSON", { virtuals: true });

export const OrderItem = model<IOrderItem>("OrderItem", orderItemSchema);

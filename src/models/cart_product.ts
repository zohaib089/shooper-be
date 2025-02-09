import { Schema, model, Document } from "mongoose";

interface ICartProduct extends Document {
  product: Schema.Types.ObjectId;
  quantity: number;
  selectedSize?: string;
  selectedColour?: string;
  productName: string;
  productImage: string;
  productPrice: string;
  reservationExpiry: Date;
  reserved: boolean;
}

const cartProductSchema = new Schema<ICartProduct>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  selectedSize: String,
  selectedColour: String,
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
  reservationExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000), // Fixed calculation
  },
  reserved: {
    type: Boolean,
    default: true,
  },
});

cartProductSchema.set("toObject", { virtuals: true });
cartProductSchema.set("toJSON", { virtuals: true });

export const CartProduct = model<ICartProduct>(
  "CartProduct",
  cartProductSchema
);

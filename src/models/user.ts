import { Schema, model, Document, Types } from "mongoose";

// Interface for wishlist item
interface IWishlistItem {
  productId: Types.ObjectId;
  productName: string;
  productPrice: number;
  productImage: string;
}

// Interface for the user document
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  role: string;
  cart: Types.ObjectId[];
  steet?: string;
  apartment?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone: string;
  resetPasswordOtp?: number;
  resetPasswordOtpExpires?: Date;
  wishlist: IWishlistItem[];
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
  cart: [
    {
      type: Schema.Types.ObjectId,
      ref: "CartProduct",
    },
  ],
  steet: String,
  apartment: String,
  city: String,
  postalCode: String,
  country: String,
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  resetPasswordOtp: Number,
  resetPasswordOtpExpires: Date,
  wishlist: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: { type: String, required: true },
      productPrice: { type: Number, required: true },
      productImage: { type: String, required: true },
    },
  ],
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

// Create and export the model
export const User = model<IUser>("User", userSchema);

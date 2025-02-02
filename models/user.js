const { Schema, model } = require("mongoose");

const userSchema = Schema({
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
    require: true,
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

exports.User = model("User", userSchema);

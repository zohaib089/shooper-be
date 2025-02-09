import { Schema, model, Document } from "mongoose";

interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  rating: number;
  colours: string[];
  image: string;
  images: string[];
  reviews: Schema.Types.ObjectId[];
  numberOfReviews: number;
  sized: string[];
  category: Schema.Types.ObjectId;
  genderAgeCategory: "men" | "women" | "unisex" | "kids";
  countInStock: number;
  dateAdded: Date;
  productInitials: string;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0.0,
  },
  colours: [
    {
      type: String,
    },
  ],
  image: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  sized: [
    {
      type: String,
    },
  ],
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  genderAgeCategory: {
    type: String,
    enum: ["men", "women", "unisex", "kids"],
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre("save", async function (next) {
  if (this.reviews.length > 0) {
    await this.populate("reviews");

    const totalRating = this.reviews.reduce(
      (acc: number, review: any) => acc + review.rating,
      0
    );
    this.rating = parseFloat((totalRating / this.reviews.length).toFixed(1));
    this.numberOfReviews = this.reviews.length;
  }
  next();
});

productSchema.index({
  name: "text",
  description: "text",
});

productSchema.virtual("productInitials").get(function (this: IProduct) {
  const words = this.name.split(" ");
  const firstBit = words[0] ? words[0][0] : "";
  const secondBit = words[1] ? words[1][0] : "";
  return (firstBit + secondBit).toUpperCase();
});

productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

export const Product = model<IProduct>("Product", productSchema);

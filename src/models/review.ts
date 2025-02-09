import { Schema, model, Document } from "mongoose";

interface IReview extends Document {
  user: Schema.Types.ObjectId;
  userName: string;
  rating: number;
  comment?: string;
  date: Date;
}

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.set("toObject", { virtuals: true });
reviewSchema.set("toJSON", { virtuals: true });

export const Review = model<IReview>("Review", reviewSchema);

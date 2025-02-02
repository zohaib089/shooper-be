const { Schema, model } = require("mongoose");

const reviewSchema = Schema({
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
exports.Review = model("Review", reviewSchema);

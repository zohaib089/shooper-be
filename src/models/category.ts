import { Schema, model } from "mongoose";

interface ICategory {
  name: string;
  colour: string;
  image: string;
  markedForDeletion: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  colour: {
    type: String,
    default: "#000000",
  },
  image: {
    type: String,
    required: true,
  },
  markedForDeletion: {
    type: Boolean,
    default: false,
  },
});

categorySchema.set("toObject", { virtuals: true });
categorySchema.set("toJSON", { virtuals: true });

export const Category = model<ICategory>("Category", categorySchema);

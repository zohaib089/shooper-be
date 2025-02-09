import { Schema, model, Document } from "mongoose";

// Interface for the token document
export interface IToken extends Document {
  userId: Schema.Types.ObjectId;
  refreshToken: string;
  accessToken?: string;
  createdAt: Date;
}

// Create the schema
const tokenSchema = new Schema<IToken>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  refreshToken: {
    type: String,
    required: true,
  },
  accessToken: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 86400, // 60 days
  },
});

// Create and export the model
export const Token = model<IToken>("Token", tokenSchema);

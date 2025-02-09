import { Request, Response } from "express";
import { Product } from "../models/product";
import { Review } from "../models/review";
import { User } from "models/user";


// Add a review to a product
export const leaveReview = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const review = {
      rating,
      comment,
      date: new Date(),
    };

    // product.reviews.push(review);
    await product.save();

    return res.status(201).json(review);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

// Get all reviews for a product
export const getProductReviews = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    return res.status(200).json(product.reviews);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

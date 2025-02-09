import { Category } from "../models/category";
import { Request, Response } from "express";

export const getCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res.status(404).json({
        message: "Categories Not Found",
      });
    }
    return res.status(200).json(categories);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        message: "Category Not Found",
      });
    }

    return res.status(200).json(category);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

import { Product } from "../models/product";

import { Request, Response } from "express";

export const getProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let products;
    const page = req.query.page || 0;
    const pageSize = 10;
    if (req.query.criteria) {
      let query: { [key: string]: any } = {}; // Define the type of the query object
      if (req.query.category) {
        query["category"] = req.query.category;
      }
      switch (req.query.criteria) {
        case "newArrivals": {
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          query["dateAdded"] = { $gte: twoWeeksAgo };
          break;
        }
        case "popular":
          query["rating"] = { $gt: 4.5 };
          break;
        default:
          break;
      }
      products = await Product.find(query)
        .select("-images -reviews -size")
        .skip(pageSize * (Number(page) - 1))
        .limit(pageSize);
    } else if (req.query.category) {
      products = await Product.find({
        category: req.query.category,
      })
        .select("-images -reviews -size")
        .skip(pageSize * (Number(page) - 1))
        .limit(pageSize);
    } else {
      products = await Product.find()
        .select("-images -reviews -size")
        .skip(pageSize * (Number(page) - 1))
        .limit(pageSize);
    }
    if (!products) {
      return res.status(404).json({
        message: "No products found",
      });
    }
    return res.json(products);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

// Add missing return statement in searchProducts function
export const searchProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const searchTerm = req.query.q;
    const page = req.query.page || 0;
    const pageSize = 10;
    let query: { [key: string]: any } = {}; // Initialize empty query object

    if (req.query.category) {
      query = { category: req.query.category };
      if (typeof req.query.genderAgeCategory === "string") {
        query["genderAgeCategory"] = req.query.genderAgeCategory.toLowerCase();
      }
    } else if (req.query.genderAgeCategory) {
      query = {
        genderAgeCategory:
          typeof req.query.genderAgeCategory === "string"
            ? req.query.genderAgeCategory.toLowerCase()
            : "",
      };
    }

    if (searchTerm) {
      query = {
        ...query,
        $text: {
          $search: searchTerm?.toString() || "",
          $language: "english",
          $caseSensitive: false,
        },
      };
    }

    const searchResults = await Product.find(query)
      .skip(pageSize * (Number(page) - 1))
      .limit(pageSize);

    if (!searchResults) {
      return res.status(404).json({
        message: "No products found",
      });
    }

    return res.json(searchResults);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

// Get product by ID
export const getProductById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select("-reviews");
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    return res.status(200).json(product);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

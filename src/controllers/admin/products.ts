import { Request, Response } from "express";
import { Product } from "../../models/product";
import { upload, deleteImages } from "../../helpers/media_helper";
import util from "util";
import { Category } from "../../models/category";
import { Review } from "../../models/review";
import { MulterError } from "multer";
import mongoose from "mongoose";

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const pageSize: number = 10;

    const products = await Product.find()
      .select("-reviews -rating")
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (!products || products.length === 0) {
      res.status(404).json({ message: "Products not found" });
      return;
    }

    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / pageSize),
      totalProducts,
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductsCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const count = await Product.countDocuments();
    if (!count) {
      res.status(500).json({
        message: "Could not count products!",
      });
      return;
    }
    res.json({
      count,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadImage = util.promisify(
      upload.fields([
        { name: "image", maxCount: 1 },
        {
          name: "images",
          maxCount: 10,
        },
      ])
    );
    try {
      await uploadImage(req, res);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({
        type: error.code,
        message: `${error.message}{${error.field}}`,
        storageErrors: error.storageErrors,
      });
      return;
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
      res.status(404).json({
        message: "Category not found",
      });
      return;
    }
    if (category.markedForDeletion) {
      res.status(404).json({
        message: "Category marked for deletion, you can not add product to it",
      });
      return;
    }
    // Add type safety check for req.files
    const image =
      req.files && "image" in req.files
        ? (req.files.image as Express.Multer.File[])[0]
        : undefined;
    if (!image) {
      res.status(404).json({
        message: "No File Found",
      });
      return;
    }
    req.body.image = `${req.protocol}://${req.get("host")}/${image.path}`;
    const gallery =
      req.files && "images" in req.files
        ? (req.files.images as Express.Multer.File[])
        : undefined;
    const imagePaths: string[] = [];
    if (gallery) {
      for (const image of gallery) {
        imagePaths.push(`${req.protocol}://${req.get("host")}/${image.path}`);
      }
    }
    if (imagePaths.length > 0) {
      req.body.images = imagePaths;
    }

    const product = await new Product(req.body).save();
    if (!product) {
      res.status(500).json({
        message: "Could not create product!",
      });
      return;
    }

    res.status(201).json(product);
  } catch (error: any) {
    console.log(error);
    if (error instanceof MulterError) {
      res.status(parseInt(error.code)).json({
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const editProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !(await Product.findById(req.params.id))
    ) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        res.status(404).json({
          message: "Category not found",
        });
        return;
      }
      if (category.markedForDeletion) {
        res.status(404).json({
          message:
            "Category marked for deletion, you can not add product to it",
        });
        return;
      }
      const product = await Product.findById(req.params.id);
      if (req.body.images) {
        const limit = 10 - (product?.images?.length || 0);
        const uploadGallery = util.promisify(
          upload.fields([
            {
              name: "images",
              maxCount: limit,
            },
          ])
        );
        try {
          await uploadGallery(req, res);
        } catch (error: any) {
          console.log(error);
          res.status(500).json({
            type: error.code,
            message: `${error.message}{${error.field}}`,
            storageErrors: error.storageErrors,
          });
          return;
        }
        const imageFiles =
          req.files && "images" in req.files
            ? (req.files.images as Express.Multer.File[])
            : undefined;
        const updateGallery = imageFiles && imageFiles.length > 0;
        if (updateGallery) {
          const imagePaths: string[] = [];
          for (const image of imageFiles) {
            imagePaths.push(
              `${req.protocol}://${req.get("host")}/${image.path}`
            );
          }
          req.body.images = [...(product?.images || []), ...imagePaths];
        }
      }
      if (req.body.image) {
        const uploadImage = util.promisify(
          upload.fields([{ name: "image", maxCount: 1 }])
        );
        try {
          await uploadImage(req, res);
        } catch (error: any) {
          console.log(error);
          res.status(500).json({
            type: error.code,
            message: `${error.message}{${error.field}}`,
            storageErrors: error.storageErrors,
          });
          return;
        }
        // Add type safety check for req.files
        const image =
          req.files && "image" in req.files
            ? (req.files.image as Express.Multer.File[])[0]
            : undefined;
        if (!image) {
          res.status(404).json({
            message: "No File Found",
          });
          return;
        }
        req.body.image = `${req.protocol}://${req.get("host")}/${image.path}`;
      }
    }
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updateProduct) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }
    res.json(updateProduct);
  } catch (error: any) {
    console.error(error);
    if (error instanceof MulterError) {
      res.status(parseInt(error.code)).json({
        message: error.message,
      });
      return;
    }
    res.status(500).json({ type: error.name, message: error.message });
  }
};

export const deleteProductImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = req.params.id;
    const { deletedImageUrls } = req.body;

    if (
      !mongoose.isValidObjectId(productId) ||
      !Array.isArray(deletedImageUrls)
    ) {
      res.status(400).json({ message: "Invalid request data" });
      return;
    }

    await deleteImages(deletedImageUrls, "ENOENT");

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      {
        $pull: {
          images: { $in: deletedImageUrls },
        },
      },
      { new: true }
    );
    console.log("updatedProduct", updatedProduct);
    if (!updatedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({
      message: "Images deleted successfully",
      remainingImages: updatedProduct.images,
    });
  } catch (error: any) {
    console.error(`Error deleting product images: ${error.message}`);
    if (error.code === "ENOENT") {
      res.status(404).json({ message: "One or more images not found" });
      return;
    }
    res.status(500).json({ message: "Failed to delete images" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId)) {
      res.status(400).json({ message: "Invalid Product" });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.image || product.images.length > 0) {
      await deleteImages([...product.images, product.image], "");
    }

    await Review.deleteMany({
      _id: { $in: product.reviews },
    });
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const { Product } = require("../../models/product");
const media_helper = require("../../helpers/media_helper");
const util = require("util");
const { Category } = require("../../models/category");
const { Review } = require("../../models/review");
const multer = require("multer");
const { default: mongoose } = require("mongoose");
exports.getProducts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const pageSize = 10;

    const products = await Product.find()
      .select("-reviews -rating") // Fixed: use space instead of comma
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }

    // Get total count for pagination
    const totalProducts = await Product.countDocuments();

    return res.status(200).json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProducts / pageSize),
      totalProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
};
exports.getProductsCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (!count) {
      return res.status(500).json({
        message: "Could not count products!",
      });
    }
    return res.json({
      count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
exports.addProduct = async (req, res) => {
  try {
    const uploadImage = util.promisify(
      media_helper.upload.fields([
        { name: "image", maxCount: 1 },
        {
          name: "images",
          maxCount: 10,
        },
      ])
    );
    try {
      await uploadImage(req, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        type: error.code,
        message: `${error.message}{${error.field}}`,
        storageErrors: error.storageErrors,
      });
    }
    const category = await Category.findById(req.body.category);
    if (!category)
      return res.status(404).json({
        message: "Category not found",
      });
    if (category.markedForDeletion) {
      return res.status(404).json({
        message: "Category marked for deletion, you can not add product to it",
      });
    }
    const image = req.files.image[0];
    if (!image) {
      return res.status(404).json({
        message: "No File Found",
      });
    }
    req.body.image = `${req.protocol}://${req.get("host")}/${image.path}`;
    const gallery = req.files.images;
    const imagePaths = [];
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
      return res.status(500).json({
        message: "Could not create product!",
      });
    }

    return res.status(201).json(product);
  } catch (error) {
    console.log(error);
    if (err instanceof multer.MulterError) {
      return res.status(err.code).json({
        message: err.message,
      });
    }
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.editProduct = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !(await Product.findById(req.params.id))
    ) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category)
        return res.status(404).json({
          message: "Category not found",
        });
      if (category.markedForDeletion) {
        return res.status(404).json({
          message:
            "Category marked for deletion, you can not add product to it",
        });
      }
      const product = await Product.findById(req.params.id);
      if (req.body.images) {
        const limit = 10 - product.images.length;
        const uploadGallery = util.promisify(
          media_helper.upload.fields([
            {
              name: "images",
              maxCount: limit,
            },
          ])
        );
        try {
          await uploadGallery(req, res);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            type: error.code,
            message: `${error.message}{${error.field}}`,
            storageErrors: error.storageErrors,
          });
        }
        const imageFiles = req.files.images;
        const updateGallery = imageFiles && imageFiles.length > 0;
        if (updateGallery) {
          const imagePaths = [];
          for (const image of imageFiles) {
            imagePaths.push(
              `${req.protocol}://${req.get("host")}/${image.path}`
            );
          }
          req.body.images = [...product.images, ...imagePaths];
        }
      }
      if (req.body.image) {
        const uploadImage = util.promisify(
          media_helper.upload.fields([{ name: "image", maxCount: 1 }])
        );
        try {
          await uploadImage(req, res);
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            type: error.code,
            message: `${error.message}{${error.field}}`,
            storageErrors: error.storageErrors,
          });
        }
        const image = req.files.image[0];
        if (!image) {
          return res.status(404).json({
            message: "No File Found",
          });
        }
        req.body.image = `${req.protocol}://${req.get("host")}/${image.path}`;
      }
    }
    const updateProduct = await Product.findByIdUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updateProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    return res.json(updateProduct);
  } catch (error) {
    console.error(error);
    if (err instanceof multer.MulterError) {
      return res.status(err.code).json({
        message: err.message,
      });
    }
    res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.deleteProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const { deletedImageUrls } = req.body;

    if (
      !mongoose.isValidObjectId(productId) ||
      !Array.isArray(deletedImageUrls)
    ) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Delete physical files
    await media_helper.deleteImages(deletedImageUrls, "ENOENT");

    // Update document and get the updated version
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      {
        $pull: {
          images: { $in: deletedImageUrls },
        },
      },
      { new: true } // This option returns the updated document
    );
    console.log("updatedProduct", updatedProduct);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Images deleted successfully",
      remainingImages: updatedProduct.images,
    });
  } catch (error) {
    console.error(`Error deleting product images: ${error.message}`);
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "One or more images not found" });
    }
    return res.status(500).json({ message: "Failed to delete images" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.isValidObjectId(productId))
      return res.status(400).json({ message: "Invalid Product" });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image || product.images.length > 0) {
      await media_helper.deleteImages([...product.images, product.image]);
    }

    await Review.deleteMany({
      _id: { $in: product.reviews },
    });
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

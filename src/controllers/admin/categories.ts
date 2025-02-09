import { Category } from "../../models/category";
import { upload } from "../../helpers/media_helper";
import { Request, Response } from "express";
import { RequestHandler } from "express";
import util from "util";

interface CategoryRequest extends Request {
  files: {
    image: Express.Multer.File[];
  };
}

export const createCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const uploadImage = util.promisify(
      upload.fields([{ name: "image", maxCount: 1 }])
    );
    try {
      await uploadImage(req, res);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({
        type: error.code,
        message: `${error.message}{${error.field}}`,
        storageErrors: error.storageErrors,
      });
    }
    // Safely access image array using optional chaining and type assertion
    const image = (req.files as CategoryRequest["files"])?.image?.[0];
    if (!image) {
      return res.status(404).json({
        message: "No File Found",
      });
    }
    req.body.image = `${req.protocol}://${req.get("host")}/${image.path}`;
    let category = new Category(req.body);
    category = await category.save();
    if (!category) {
      return res.status(500).json({
        message: "Failed to add Category",
      });
    }
    return res.status(200).json({
      message: "Category Added Successfully",
      category,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const deleteCategory = async (
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
    category.markedForDeletion = true;
    await category.save();
    return res.status(204).end();
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

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
    return res.status(200).json({
      message: "Categories Fetched Successfully",
      categories,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, icon, colour } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, colour },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({
        message: "Category Not Found",
      });
    }

    return res.status(200).json({
      message: "Category Updated Successfully",
      category,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

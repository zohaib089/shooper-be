const { Category } = require("../../models/category");
const media_helper = require("../../helpers/media_helper");
const util = require("util");
exports.createCategory = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.getCategories = async (req, res) => {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

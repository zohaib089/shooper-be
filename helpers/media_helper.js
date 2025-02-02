const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { unlink } = require("fs/promises");
const ALLOWED_EXTENSION = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, "public/uploads");
  },
  filename: function (_, file, cb) {
    const uniqueId = uuidv4();
    const filename = file.originalname
      .replace("", "-")
      .replace(".png", "")
      .replace("jpg", "")
      .replace("jpeg", "");
    const extension = ALLOWED_EXTENSION[file.mimetype];
    cb(null, `${filename}-${uniqueId}.${extension}`);
  },
});
exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (_, file, cb) => {
    const isValid = ALLOWED_EXTENSION[file.mimetype];
    let uploadError = new Error(
      `Invalid image type\n${file.mimetype} is not allowed`
    );
    if (!isValid) cb(uploadError);
    return cb(null, true);
  },
});

exports.deleteImages = async (imageUrls, continueOnErrorName) => {
  await Promise.all(
    imageUrls.map(async (imageUrl) => {
      // Extract only the filename from the full URL/path
      const filename = path.basename(imageUrl);

      // Construct the correct path to the image
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        filename
      );

      try {
        await unlink(imagePath);
        console.log(`Successfully deleted: ${imagePath}`);
      } catch (error) {
        console.error(`Failed to delete ${imagePath}:`, error);
        if (error.name === continueOnErrorName) {
          console.error(`Continuing with the next image: ${error.message}`);
        } else {
          throw error;
        }
      }
    })
  );
};

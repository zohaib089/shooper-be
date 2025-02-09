import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { unlink } from "fs/promises";

interface AllowedExtensions {
  [key: string]: string;
}

const ALLOWED_EXTENSION: AllowedExtensions = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const storage: multer.StorageEngine = multer.diskStorage({
  destination: function (
    _: Express.Request,
    _2: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void {
    cb(null, "public/uploads");
  },
  filename: function (
    _: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ): void {
    const filename = file.originalname
      .replace("", "-")
      .replace(".png", "")
      .replace("jpg", "")
      .replace("jpeg", "");
    const extension = ALLOWED_EXTENSION[file.mimetype];
    cb(null, `${filename}-${uuidv4()}.${extension}`);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (
    _: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ): void => {
    const isValid = ALLOWED_EXTENSION[file.mimetype];
    const uploadError: Error = new Error(
      `Invalid image type\n${file.mimetype} is not allowed`
    );
    if (!isValid) cb(uploadError);
    return cb(null, true);
  },
});

export const deleteImages = async (
  imageUrls: string[],
  continueOnErrorName: string
): Promise<void> => {
  await Promise.all(
    imageUrls.map(async (imageUrl: string) => {
      // Extract only the filename from the full URL/path
      const filename: string = path.basename(imageUrl);

      // Construct the correct path to the image
      const imagePath: string = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        filename
      );

      try {
        await unlink(imagePath);
        console.log(`Successfully deleted: ${imagePath}`);
      } catch (error: any) {
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

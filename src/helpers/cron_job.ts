import cron from "node-cron";
import { Category } from "../models/category";
import { Product } from "../models/product";

cron.schedule("0 0 * * *", async (): Promise<void> => {
  try {
    const categoriesToBeDeleted = await Category.find({
      markedForDeletion: true,
    });
    for (const category of categoriesToBeDeleted) {
      const categoryProductsCount: number = await Product.countDocuments({
        category: category.id,
      });
      if (categoryProductsCount < 1) await category.deleteOne();
    }
  } catch (error) {
    console.log("CRON JOB ERROR", error);
  }
});

import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Import middleware
import authJwt from "./middlewares/jwt";
import errorHandler from "./middlewares/error_handler";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import adminRoutes from "./routes/admin";
import categoryRoutes from "./routes/categories";
import productRoutes from "./routes/products";
// Import helpers
import "./helpers/cron_job";

// Configure environment variables
dotenv.config();

const app: Application = express();
const env = process.env;

const PORT: number = parseInt(env.PORT || "3000", 10);
const API: string = env.API_PREFIX || "";
console.log(API);
// Middleware
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());
app.use(authJwt());
app.use(errorHandler);

// Routes
app.use(`${API}/`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/products`, productRoutes);
app.use("/public", express.static(path.join(__dirname, "public")));

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30-second timeout
    } as mongoose.ConnectOptions); // Cast options to mongoose.ConnectOptions
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Exit the app on failure
  }
};

// Connect to MongoDB BEFORE starting Express
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });

export default app;

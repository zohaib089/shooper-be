const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const authJwt = require("./middlewares/jwt");
const errorHandler = require("./middlewares/error_handler");

const app = express();
const env = process.env;

// Validate environment variables
if (!env.DB_CONNECTION_STRING) {
  throw new Error("DB_CONNECTION_STRING is not defined in .env");
}

const PORT = env.PORT || 3000;
const HOSTNAME = env.HOSTNAME || "0.0.0.0";
const API = env.API_PREFIX.startsWith("/")
  ? env.API_PREFIX
  : `/${env.API_PREFIX}`;

// Middleware
app.use(morgan("tiny"));
app.use(express.json());
app.use(cors());
app.options("*", cors());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  })
);
app.use(authJwt());
app.use(errorHandler);

// Routes
const auth = require("./routes/auth");
const users = require("./routes/users");
const admin = require("./routes/admin");

app.use(`${API}/`, auth);
app.use(`${API}/users`, users);
app.use(`${API}/admin`, admin);

// Serve static files
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
app.use("/public", express.static(publicDir));

// Database connection
mongoose
  .connect(env.DB_CONNECTION_STRING)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Server initialization
const server = app.listen(PORT, HOSTNAME, () => {
  console.log(`Server Running on ${HOSTNAME}:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    server.close(() => {
      console.log("Server stopped.");
      process.exit(0);
    });
  });
});

// Global error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

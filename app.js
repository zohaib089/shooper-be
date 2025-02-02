const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
const authJwt = require("./middlewares/jwt");
const errorHandler = require("./middlewares/error_handler");

const app = express();
const env = process.env;

const PORT = env.PORT || 3000;
const HOSTNAME = env.HOSTNAME || "0.0.0.0";
const API = env.API_PREFIX;
app.use(morgan("tiny"));

app.use(bodyParser.json());

app.use(cors());
app.options("*", cors());
app.use(authJwt());
app.use(errorHandler);

//Routes
const auth = require("./routes/auth");
const users = require("./routes/users");
const admin = require("./routes/admin");

app.use(`${API}/`, auth);
app.use(`${API}/users`, users);
app.use(`${API}/admin`, admin);
app.use("/public", express.static(__dirname + "/public"));

mongoose
  .connect(env.DB_CONNECTION_STRING)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

//Server Running
app.listen(PORT, () => {
  console.log(`Server Running on http://${HOSTNAME}:${PORT}`);
});

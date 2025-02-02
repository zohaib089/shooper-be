const jwt = require("jsonwebtoken");
const { Token } = require("../models/token");
async function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    if (!err.message.includes("Invalid token")) {
      return res
        .status(err.status)
        .json({ type: err.name, message: err.message });
    }

  try {
    const tokenHeader = req.headers("Authorization");
    const accessToken = tokenHeader && tokenHeader.split(" ")[1];
    const token = await Token.findOne({
      accessToken,
      refreshToken: {
        $exists: true,
      },
    });
    if (!token) {
      return res.status(401).json({
        type: "Authentication Error",
        message: "Token does not exist",
      });
    }
    const userData = jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(userData.id);
    if (!user) {
      return res.status(404).json({
        message: "Invalid User",
      });
    }
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "24h",
      }
    );
    req.headers("Authorization") = `Bearer ${newAccessToken}`;
    await Token.updateOne({
        _id:token.id
    },{
        accessToken:newAccessToken
    }).exec();
    res.set('Authorization',`Bearer ${newAccessToken}`);
    return next();
  } catch (refreshError) {
    return res
      .status(401)
      .json({ type: "Authentication Error", message: refreshError.message });
  }
}

return res
  .status(err.status)
  .json({ type: err.name, message: err.message });
}

module.exports = errorHandler;
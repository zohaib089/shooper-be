import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Token } from "../models/token";
import { User } from "../models/user";

interface JwtPayload {
  id: string;
  isAdmin: boolean;
}

interface UnauthorizedError extends Error {
  status: number;
  name: string;
  message: string;
}

async function errorHandler(
  err: UnauthorizedError,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  if (err.name === "UnauthorizedError") {
    if (!err.message.includes("Invalid token")) {
      return res
        .status(err.status)
        .json({ type: err.name, message: err.message });
    }

    try {
      const tokenHeader = req.headers.authorization;
      const accessToken = tokenHeader?.split(" ")[1];

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
        process.env.REFRESH_TOKEN_SECRET as string
      ) as JwtPayload;

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
        process.env.ACCESS_TOKEN_SECRET as string,
        {
          expiresIn: "24h",
        }
      );

      // Fix: Use req.headers directly instead of as a function
      req.headers.authorization = `Bearer ${newAccessToken}`;

      await Token.updateOne(
        {
          _id: token.id,
        },
        {
          accessToken: newAccessToken,
        }
      ).exec();

      res.set("Authorization", `Bearer ${newAccessToken}`);
      return next();
    } catch (refreshError) {
      return res.status(401).json({
        type: "Authentication Error",
        message:
          refreshError instanceof Error
            ? refreshError.message
            : "Unknown error",
      });
    }
  }

  return res.status(err.status).json({ type: err.name, message: err.message });
}

export default errorHandler;

import { Request } from "express";
import { expressjwt, GetVerificationKey } from "express-jwt";
import { JwtPayload, Jwt } from "jsonwebtoken";

import { Token } from "../models/token";

interface CustomJwtPayload extends JwtPayload {
  isAdmin: boolean;
}

interface RequestWithJWT extends Request {
  auth?: CustomJwtPayload;
}

// The authJwt middleware checks if the request path matches any of the whitelisted paths in the unless() block
// If the path is not in the whitelist, it will:
// 1. Verify the JWT token is valid using the secret
// 2. Check if the token is revoked using isRevoked()
// 3. Allow the request if token is valid and not revoked
const authJwt = () => {
  const API: string = process.env.API_PREFIX || "";
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "ACCESS_TOKEN_SECRET is not defined in environment variables"
    );
  }

  return expressjwt({
    secret: secret, // Pass the secret directly as a string
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      `${API}/login`,
      `${API}/login/`,

      `${API}/register`,
      `${API}/register/`,

      `${API}/forgot-password`,
      `${API}/forgot-password/`,

      `${API}/verify-token`,
      `${API}/verify-token/`,

      `${API}/verify-otp`,
      `${API}/verify-otp/`,

      `${API}/reset-password`,
      `${API}/reset-password/`,
    ],
  });
};

// isRevoked checks if a token should be considered invalid
// It returns true (token revoked) if:
// 1. No Authorization header or invalid Bearer token format
// 2. Token is not found in the database (tokenDoc is null)
// 3. Non-admin user tries to access admin routes
const isRevoked = async (
  req: RequestWithJWT,
  token: Jwt | undefined
): Promise<boolean> => {
  const authHeader: string | undefined = req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("No Authorization header or invalid Bearer token format");
    return true;
  }

  const accessToken: string = authHeader.replace("Bearer ", "  ").trim();
  const tokenDoc = await Token.findOne({ accessToken });
  const adminRouteRegex: RegExp = /^\/api\/v1\/admin\//i;
  const adminFault: boolean =
    !(token?.payload as CustomJwtPayload)?.isAdmin &&
    adminRouteRegex.test(req.originalUrl);

  return adminFault || !tokenDoc;
};

export default authJwt;

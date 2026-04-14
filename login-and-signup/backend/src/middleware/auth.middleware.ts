import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  // Retrieve token from HttpOnly cookie
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    return;
  }

  try {
    // 1. Check Redis blacklist
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
      res.status(401).json({ success: false, message: "Token has been revoked/logged out" });
      return;
    }

    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    req.user = decoded; // Contains userId etc.
    next();
  } catch (error: any) {
    // If access token is expired, frontend should silently hit /refresh route
    res.status(401).json({ success: false, message: error.name === "TokenExpiredError" ? "TokenExpired" : "Not authorized, token failed" });
  }
};

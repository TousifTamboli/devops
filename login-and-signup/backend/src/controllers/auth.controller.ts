import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import crypto from "crypto";
import { User } from "../models/user.model";
import { RefreshToken } from "../models/refreshToken.model";
import redisClient from "../config/redis";

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "15m",
  });
  
  const refreshTokenString = crypto.randomBytes(40).toString("hex");
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return { accessToken, refreshTokenString, refreshTokenExpiry };
};

const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: passwordValidation,
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = signupSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ success: false, message: parsedData.error.message });
      return;
    }

    const { name, email, password } = parsedData.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists with this email" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedData = loginSchema.safeParse(req.body);
    if (!parsedData.success) {
      res.status(400).json({ success: false, message: parsedData.error.message });
      return;
    }

    const { email, password } = parsedData.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const { accessToken, refreshTokenString, refreshTokenExpiry } = generateTokens(user._id.toString());

    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiry,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const rTokenCookie = req.cookies.refreshToken;
    if (!rTokenCookie) {
      res.status(401).json({ success: false, message: "No refresh token provided" });
      return;
    }

    const tokenDoc = await RefreshToken.findOne({ token: rTokenCookie, revoked: false });
    if (!tokenDoc) {
      res.status(401).json({ success: false, message: "Invalid or revoked refresh token" });
      return;
    }

    if (tokenDoc.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: tokenDoc._id });
      res.status(401).json({ success: false, message: "Refresh token expired" });
      return;
    }

    const { accessToken, refreshTokenString, refreshTokenExpiry } = generateTokens(tokenDoc.userId.toString());

    // Rotate refresh token (revoke old, create new)
    tokenDoc.revoked = true;
    await tokenDoc.save();

    await RefreshToken.create({
      userId: tokenDoc.userId,
      token: refreshTokenString,
      expiresAt: refreshTokenExpiry,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (refreshToken) {
      // Revoke from DB
      await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true });
    }

    if (accessToken) {
      // Store access token in Redis blacklist until it naturally expires (max 15 mins)
      try {
        const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
        if (decoded && decoded.exp) {
          const expirationTime = decoded.exp - Math.floor(Date.now() / 1000);
          if (expirationTime > 0) {
            await redisClient.setex(`bl_${accessToken}`, expirationTime, "true");
          }
        }
      } catch (e) {
        // Ignore jwt decode errors on logout
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const me = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

import express from "express";
import { signup, login, refresh, logout, me } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { loginRateLimiter } from "../middleware/rate-limiter.middleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", loginRateLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me); // Protected route explicitly checking redis token blacklist

export default router;

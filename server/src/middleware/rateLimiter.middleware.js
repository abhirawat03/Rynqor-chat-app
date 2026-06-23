import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// Strict limit for authentication & password changes (30 requests per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError(429, options.message, "TOO_MANY_REQUESTS"));
  },
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

// Moderate limit for file uploads to protect storage bandwidth (10 uploads per 5 minutes)
export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError(429, options.message, "TOO_MANY_REQUESTS"));
  },
  message: "Too many file upload attempts. Please try again in 5 minutes.",
});

// Loose global API rate limiter (100 requests per minute)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError(429, options.message, "TOO_MANY_REQUESTS"));
  },
  message: "Too many requests. Please try again in a minute.",
});

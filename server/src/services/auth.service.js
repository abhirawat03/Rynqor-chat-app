import crypto from "crypto";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

import { RefreshToken } from "../models/refreshToken.model.js";
import { verifyRefreshToken } from "../utils/verifyToken.js";
import { sendEmail, getOtpTemplate, getVerificationTemplate } from "./email.service.js";

// ==============================
// Helper
// ==============================

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ==============================
// Register
// ==============================

const registerService = async (
  { username, email, password, fullName },
  deviceInfo,
) => {
  email = email.toLowerCase().trim();
  username = username.toLowerCase().trim();

  // If unverified user with same email or username exists, delete to allow clean re-signup
  const existingEmail = await User.findOne({ email });
  const existingUsername = await User.findOne({ username });

  if (existingEmail) {
    if (existingEmail.isVerified) {
      throw new ApiError(400, "Email is already registered");
    } else {
      await User.deleteOne({ _id: existingEmail._id });
    }
  }

  if (existingUsername) {
    if (existingUsername.isVerified) {
      throw new ApiError(400, "Username is already taken");
    } else {
      await User.deleteOne({ _id: existingUsername._id });
    }
  }

  // Generate cryptographically secure 6-digit verification code
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hour expiry

  const user = await User.create({
    fullName,
    username,
    email,
    password,
    isVerified: false,
    verificationOtp: otp,
    verificationOtpExpires: otpExpires,
  });

  // Non-blocking background email dispatch
  sendEmail({
    to: user.email,
    subject: "Verify your Rynqor account",
    text: `Your verification code is: ${otp}. This code expires in 24 hours.`,
    html: getVerificationTemplate(otp, user.fullName),
  }).catch((err) => {
    console.error("❌ Failed to send registration verification email:", err.message);
  });

  return {
    email: user.email,
    message: "Verification OTP sent",
  };
};

// ==============================
// Login
// ==============================

const loginService = async ({ login, password }, deviceInfo) => {
  login = login.toLowerCase().trim();

  const user = await User.findOne({
    $or: [{ email: login }, { username: login }],
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  // Prevent logging in if user is not verified
  if (!user.isVerified) {
    throw new ApiError(
      403,
      "Your email is not verified. Please verify your email first.",
      "EMAIL_NOT_VERIFIED",
      [{ email: user.email }],
    );
  }

  const accessToken = generateAccessToken(user._id);

  const refreshToken = generateRefreshToken(user._id);

  const hashedRefreshToken = hashToken(refreshToken);

  const session = await RefreshToken.create({
    user: user._id,

    token: hashedRefreshToken,

    device: deviceInfo.device,

    ipAddress: deviceInfo.ipAddress,

    location: deviceInfo.location,

    userAgent: deviceInfo.userAgent,

    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const sanitizedUser = {
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
  };

  return {
    user: sanitizedUser,
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
};

// ==============================
// Refresh Access Token
// ==============================

const refreshAccessTokenService = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing", "REFRESH_TOKEN_MISSING");
  }

  const decoded = verifyRefreshToken(incomingRefreshToken);

  if (!decoded?._id) {
    throw new ApiError(401, "Invalid refresh token", "REFRESH_TOKEN_INVALID");
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, "User not found", "REFRESH_TOKEN_INVALID");
  }

  const hashedIncomingToken = hashToken(incomingRefreshToken);

  const storedToken = await RefreshToken.findOne({
    token: hashedIncomingToken,
    user: decoded._id,
  });

  if (!storedToken) {
    throw new ApiError(401, "Refresh token revoked", "REFRESH_TOKEN_REVOKED");
  }

  if (storedToken.expiresAt < new Date()) {
    await storedToken.deleteOne();

    throw new ApiError(401, "Refresh token expired", "REFRESH_TOKEN_EXPIRED");
  }

  const accessToken = generateAccessToken(user._id);

  const refreshToken = generateRefreshToken(user._id);

  const hashedRefreshToken = hashToken(refreshToken);

  storedToken.token = hashedRefreshToken;

  storedToken.lastUsedAt = new Date();

  storedToken.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await storedToken.save();

  return {
    accessToken,
    refreshToken,
    sessionId: storedToken._id,
  };
};

// ==============================
// Logout
// ==============================

const logoutService = async (refreshToken) => {
  if (!refreshToken) {
    return true;
  }

  const hashedRefreshToken = hashToken(refreshToken);

  await RefreshToken.deleteOne({
    token: hashedRefreshToken,
  });

  return true;
};

// ==============================
// Logout Specific Session
// ==============================

const logoutSessionService = async (userId, sessionId) => {
  await RefreshToken.deleteOne({
    _id: sessionId,
    user: userId,
  });

  return true;
};

// ==============================
// Get Sessions
// ==============================

const getSessionsService = async (userId) => {
  return await RefreshToken.find({
    user: userId,
  })
    .select(
      `
        _id
        device
        location
        lastUsedAt
        createdAt
    `,
    )
    .sort({
      createdAt: -1,
    });
};

// ==============================
// Current User
// ==============================

const getCurrentUserService = async (userId) => {
  const user = await User.findById(userId).select(`
            username
            fullName
            email
            avatar
            bio
        `);

  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  return user;
};

const checkUsernameAvailabilityService = async (username) => {
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  const normalizedUsername = username.toLowerCase().trim();
  const existing = await User.findOne({ username: normalizedUsername });
  return !existing;
};

const forgotPasswordService = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  // Generate a cryptographically secure 6-digit numeric OTP
  const otp = crypto.randomInt(100000, 1000000).toString();

  // Set OTP and expiry (10 minutes)
  user.resetOtp = otp;
  user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  // Send production-grade email asynchronously (runs in the background)
  sendEmail({
    to: user.email,
    subject: "Rynqor Chat — Password Reset Verification Code",
    text: `Hi ${user.fullName || user.username}, your password reset verification code is: ${otp}. It expires in 10 minutes.`,
    html: getOtpTemplate(otp, user.fullName || user.username),
  }).catch((err) => {
    console.error("❌ Background email transmission failed:", err.message);
  });

  return null;
};

const resetPasswordService = async (email, otp, newPassword) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.resetOtp || user.resetOtp !== otp) {
    throw new ApiError(400, "Invalid or missing OTP");
  }

  if (!user.resetOtpExpires || user.resetOtpExpires < new Date()) {
    // Clear expired OTP
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();
    throw new ApiError(400, "OTP has expired");
  }

  // Set new password (will trigger the pre-save bcrypt hash middleware)
  user.password = newPassword;
  user.resetOtp = null;
  user.resetOtpExpires = null;
  await user.save();

  // Revoke all active sessions for this user on password reset (production-grade security!)
  await RefreshToken.deleteMany({ user: user._id });

  return null;
};

// ==============================
// Verify Email
// ==============================

const verifyEmailService = async ({ email, otp }, deviceInfo) => {
  email = email.toLowerCase().trim();
  const trimmedOtp = otp.trim();

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  if (user.verificationOtp !== trimmedOtp) {
    throw new ApiError(400, "Invalid verification code");
  }

  if (!user.verificationOtpExpires || user.verificationOtpExpires < new Date()) {
    throw new ApiError(400, "Verification code has expired");
  }

  // Activate user profile
  user.isVerified = true;
  user.verificationOtp = null;
  user.verificationOtpExpires = null;
  await user.save();

  // Create active login session
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  const hashedRefreshToken = hashToken(refreshToken);

  const session = await RefreshToken.create({
    user: user._id,
    token: hashedRefreshToken,
    device: deviceInfo.device,
    ipAddress: deviceInfo.ipAddress,
    location: deviceInfo.location,
    userAgent: deviceInfo.userAgent,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const sanitizedUser = {
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
  };

  return {
    user: sanitizedUser,
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
};

// ==============================
// Resend Verification
// ==============================

const resendVerificationService = async ({ email }) => {
  email = email.toLowerCase().trim();

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  user.verificationOtp = otp;
  user.verificationOtpExpires = otpExpires;
  await user.save();

  // Background email sending
  sendEmail({
    to: user.email,
    subject: "Verify your Rynqor account",
    text: `Your verification code is: ${otp}. This code expires in 24 hours.`,
    html: getVerificationTemplate(otp, user.fullName),
  }).catch((err) => {
    console.error("❌ Failed to resend verification email:", err.message);
  });

  return {
    email: user.email,
    message: "Verification OTP resent successfully",
  };
};

export {
  registerService,
  loginService,
  verifyEmailService,
  resendVerificationService,
  refreshAccessTokenService,
  logoutService,
  logoutSessionService,
  getSessionsService,
  getCurrentUserService,
  checkUsernameAvailabilityService,
  forgotPasswordService,
  resetPasswordService,
};

import {
  registerService,
  loginService,
  verifyEmailService,
  resendVerificationService,
  getCurrentUserService,
  logoutService,
  getSessionsService,
  logoutSessionService,
  refreshAccessTokenService,
  checkUsernameAvailabilityService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getDeviceInfo } from "../utils/getDeviceInfo.js";

// Base security configurations for session cookies.
// - httpOnly: blocks client-side script access (mitigating XSS extraction).
// - secure: forces transmission over encrypted TLS/HTTPS connections only.
// - sameSite: Lax in local dev, None in production to allow cross-origin requests.
const cookieOptions = {
  httpOnly: true,

  secure: process.env.NODE_ENV === "production",

  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  path: "/",
};

// Creates a new user profile, issues a short-lived access JWT, and initiates a persistent session with device tracking.
const register = async (req, res) => {
  const deviceInfo = getDeviceInfo(req);

  const result = await registerService(req.body, deviceInfo);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        result,
        "Registration successful. Please verify your email.",
      ),
    );
};

// Authenticates credentials, generates JWT access/refresh token pair, and tracks current device/location metadata.
const login = async (req, res) => {
  const deviceInfo = getDeviceInfo(req);

  const { user, accessToken, refreshToken, sessionId } = await loginService(
    req.body,
    deviceInfo,
  );

  return res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,

      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,

      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .cookie("sessionId", sessionId.toString(), {
      ...cookieOptions,

      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(new ApiResponse(200, user, "Login Successful"));
};

// Rotates JWT tokens using the long-lived refresh token cookie, validating it against active DB sessions.
const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  const { accessToken, refreshToken, sessionId } =
    await refreshAccessTokenService(incomingRefreshToken);

  return res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .cookie("sessionId", sessionId.toString(), {
      ...cookieOptions,

      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(new ApiResponse(200, null, "Access token refreshed"));
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  await logoutService(refreshToken);

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("sessionId", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, "Logout successful"));
};

const logoutSession = async (req, res) => {
  const { sessionId } = req.params;

  await logoutSessionService(req.user._id, sessionId);

  return res.status(200).json(new ApiResponse(200, null, "Session logged out"));
};

// Retrieves all active device sessions for the authenticated user, identifying the current session.
const getSessions = async (req, res) => {
  const sessions = await getSessionsService(req.user._id);

  const currentSessionId = req.cookies?.sessionId;

  // Flag the matching sessionId so the UI can highlight "This Device" and support remote logouts
  const formattedSessions = sessions.map((session) => ({
    ...session.toObject(),

    isCurrent: session._id.toString() === currentSessionId,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, formattedSessions, "Sessions fetched successfully"),
    );
};

const getCurrentUser = async (req, res) => {
  // Disable caching to prevent shared-browser environments from leaking private user profiles
  res.set("Cache-Control", "no-store");
  if (!req.user) throw new ApiError(401, "Unauthorized");

  const user = await getCurrentUserService(req.user?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user fetched successfully"));
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  await forgotPasswordService(email);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset OTP sent successfully"));
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await resetPasswordService(email, otp, newPassword);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully"));
};

const checkUsernameAvailability = async (req, res) => {
  const { username } = req.query;
  const isAvailable = await checkUsernameAvailabilityService(username);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { available: isAvailable },
        "Username availability checked successfully",
      ),
    );
};

const verifyEmail = async (req, res) => {
  const deviceInfo = getDeviceInfo(req);

  const { user, accessToken, refreshToken, sessionId } =
    await verifyEmailService(req.body, deviceInfo);

  return res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .cookie("sessionId", sessionId.toString(), {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "Email verified and logged in successfully",
      ),
    );
};

const resendVerification = async (req, res) => {
  const result = await resendVerificationService(req.body);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        "Verification code resent successfully",
      ),
    );
};

export {
  register,
  login,
  verifyEmail,
  resendVerification,
  refreshAccessToken,
  logout,
  getSessions,
  logoutSession,
  getCurrentUser,
  checkUsernameAvailability,
  forgotPassword,
  resetPassword,
};

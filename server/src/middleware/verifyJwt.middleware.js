import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/verifyToken.js";

const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // ---------------------------------
    // ACCESS TOKEN MISSING
    // ---------------------------------

    if (!token) {
      return next(
        new ApiError(401, "Access token missing", "ACCESS_TOKEN_MISSING"),
      );
    }

    // ---------------------------------
    // VERIFY ACCESS TOKEN
    // ---------------------------------

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    return next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err);

    // ---------------------------------
    // ACCESS TOKEN EXPIRED
    // ---------------------------------

    if (err.name === "TokenExpiredError") {
      return next(
        new ApiError(401, "Access token expired", "ACCESS_TOKEN_EXPIRED"),
      );
    }

    // ---------------------------------
    // ACCESS TOKEN INVALID
    // ---------------------------------

    if (err.name === "JsonWebTokenError") {
      return next(
        new ApiError(401, "Invalid access token", "ACCESS_TOKEN_INVALID"),
      );
    }

    // ---------------------------------
    // AUTH FAILED
    // ---------------------------------

    return next(
      new ApiError(401, err.message || "Authentication failed", "AUTH_FAILED"),
    );
  }
};

export { verifyJwt };

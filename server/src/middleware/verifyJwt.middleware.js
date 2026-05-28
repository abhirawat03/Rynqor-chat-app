import {
  ApiError
} from "../utils/ApiError.js";

import {
  verifyAccessToken
} from "../utils/verifyToken.js";

const verifyJwt =
async (
  req,
  res,
  next
) => {

  try {

    const token =

      req.cookies.accessToken ||

      req.header("Authorization")
        ?.replace("Bearer ", "");

    // -----------------------------
    // TOKEN MISSING
    // -----------------------------

    if (!token) {

      return next(
        new ApiError(
          401,
          "Unauthorized",
          "TOKEN_MISSING"
        )
      );

    }

    // -----------------------------
    // VERIFY TOKEN
    // -----------------------------

    const decoded =
      verifyAccessToken(
        token
      );

    req.user =
      decoded;

    next();

  } catch (err) {

    console.error(
      "JWT VERIFY ERROR:",
      err
    );

    // -----------------------------
    // TOKEN EXPIRED
    // -----------------------------

    if (
      err.name ===
      "TokenExpiredError"
    ) {

      return next(
        new ApiError(
          401,
          "Access token expired",
          "TOKEN_EXPIRED"
        )
      );

    }

    // -----------------------------
    // INVALID TOKEN
    // -----------------------------

    if (
      err.name ===
      "JsonWebTokenError"
    ) {

      return next(
        new ApiError(
          401,
          "Invalid token",
          "TOKEN_INVALID"
        )
      );

    }

    // -----------------------------
    // FALLBACK
    // -----------------------------

    return next(
      new ApiError(
        401,
        err.message ||
        "Authentication failed",
        "AUTH_FAILED"
      )
    );

  }

};

export {
  verifyJwt
};
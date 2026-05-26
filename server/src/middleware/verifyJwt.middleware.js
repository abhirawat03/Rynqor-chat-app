import { ApiError }
from "../utils/ApiError.js";

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
      req.cookies.accessToken;

    if (!token) {

      return next(
        new ApiError(
          401,
          "Unauthorized",
          "TOKEN_MISSING"
        )
      );

    }

    const decoded =
      verifyAccessToken(token);

    req.user = decoded;

    next();

  } catch (err) {

    // token expired
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

    // invalid token
    return next(
      new ApiError(
        401,
        "Invalid token",
        "TOKEN_INVALID"
      )
    );

  }

};

export { verifyJwt };
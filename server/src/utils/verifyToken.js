import jwt from "jsonwebtoken";

import {
    ACCESS_TOKEN,
    REFRESH_TOKEN,
} from "../config/config.js";

import {
    ApiError,
} from "../utils/ApiError.js";

// -------------------------------------
// VERIFY ACCESS TOKEN
// -------------------------------------

const verifyAccessToken =
    (token) => {

        if (!token) {

            throw new ApiError(
                401,
                "Access token missing",
                "TOKEN_MISSING"
            );

        }

        // IMPORTANT:
        // let jwt.verify throw native errors
        // like TokenExpiredError

        return jwt.verify(
            token,
            ACCESS_TOKEN.secret
        );

    };

// -------------------------------------
// VERIFY REFRESH TOKEN
// -------------------------------------

const verifyRefreshToken =
    (token) => {

        if (!token) {

            throw new ApiError(
                401,
                "Refresh token missing",
                "REFRESH_TOKEN_MISSING"
            );

        }

        return jwt.verify(
            token,
            REFRESH_TOKEN.secret
        );

    };

export {
    verifyAccessToken,
    verifyRefreshToken,
};
// import jwt from "jsonwebtoken";
// import { ACCESS_TOKEN } from "../config/config.js";

// const verifyToken = (token) => {
//     const decoded = jwt.verify(token, ACCESS_TOKEN.secret);
//     return decoded
// }

// export {verifyToken};

import jwt from "jsonwebtoken";

import {
    ACCESS_TOKEN,
    REFRESH_TOKEN
} from "../config/config.js";

import { ApiError } from "../utils/ApiError.js";

const verifyAccessToken = (token) => {
    try {

        if (!token) {
            throw new ApiError(
                401,
                "Access token missing"
            );
        }

        const decoded = jwt.verify(
            token,
            ACCESS_TOKEN.secret
        );

        return decoded;

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            throw new ApiError(
                401,
                "Access token expired"
            );
        }

        throw new ApiError(
            401,
            "Invalid access token"
        );
    }
};

const verifyRefreshToken = (token) => {
    try {

        if (!token) {
            throw new ApiError(
                401,
                "Refresh token missing"
            );
        }

        const decoded = jwt.verify(
            token,
            REFRESH_TOKEN.secret
        );

        return decoded;

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            throw new ApiError(
                401,
                "Refresh token expired"
            );
        }

        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }
};

export {
    verifyAccessToken,
    verifyRefreshToken
};
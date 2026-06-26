import jwt from "jsonwebtoken";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/config.js";

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { _id: userId },

    ACCESS_TOKEN.secret,

    {
      expiresIn: ACCESS_TOKEN.expiry,
    },
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { _id: userId },

    REFRESH_TOKEN.secret,

    {
      expiresIn: REFRESH_TOKEN.expiry,
    },
  );
};

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  path: "/",
};

export const setAuthCookies = (res, { accessToken, refreshToken, sessionId }) => {
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
    });
};

export const clearAuthCookies = (res) => {
  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("sessionId", cookieOptions);
};

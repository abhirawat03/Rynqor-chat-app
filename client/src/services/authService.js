import Api from "./api.js";

const signup = async (data) => {
  const res = await Api.post("/auth/register", data);
  return res.data.data;
};

const login = async (data) => {
  const res = await Api.post("/auth/login", data);
  return res.data.data;
};

const getCurrentUser = async () => {
  const res = await Api.get("/auth/current-user");
  return res.data.data;
};

const refreshAccessToken = async () => {
  const res = await Api.post("/auth/refresh-token");
  return res.data.data;
};

const logout = async () => {
  const res = await Api.post("/auth/logout");
  return res.data.data;
};

const getSessions = async () => {
  const res = await Api.get("/auth/sessions");
  return res.data.data;
};

const logoutSession = async (sessionId) => {
  const res = await Api.post(`/auth/logout-session/${sessionId}`);

  return res.data.data;
};

const checkUsername = async (username) => {
  const res = await Api.get(`/auth/check-username`, {
    params: { username },
  });
  return res.data.data;
};

const forgotPassword = async (email) => {
  const res = await Api.post("/auth/forgot-password", { email });
  return res.data.data;
};

const resetPassword = async (email, otp, newPassword) => {
  const res = await Api.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return res.data.data;
};

export {
  signup,
  login,
  getCurrentUser,
  refreshAccessToken,
  logout,
  getSessions,
  logoutSession,
  checkUsername,
  forgotPassword,
  resetPassword,
};

import Api from "./api.js";

const getUser = async (id) => {
  const res = await Api.get(`/users/${id}`);
  return res.data.data;
};

const updateProfile = async (payload) => {
  const res = await Api.patch("/users/profile", payload);
  return res.data.data;
};

const updateAvatar = async (payload) => {
  const res = await Api.patch("/users/avatar", payload);
  return res.data.data;
};

const deleteAvatar = async () => {
  const res = await Api.delete("/users/avatar");
  return res.data.data;
};

const changePassword = async (payload) => {
  const res = await Api.patch("/users/change-password", payload);
  return res.data.data;
};

const searchUsers = async (query) => {
  const res = await Api.get("/users/search", { params: { search: query } });
  return res.data.data;
};

export {
  getUser,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  changePassword,
  searchUsers,
};

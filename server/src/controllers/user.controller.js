import {
  changePasswordService,
  deleteAvatarService,
  getUserService,
  searchUserService,
  updateAvatarService,
  updateProfileService,
} from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { invalidateCache } from "../middleware/cache.middleware.js";

const getUser = async (req, res) => {
  const { id } = req.params;
  const user = await getUserService(id);
  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
};

const updateProfile = async (req, res) => {
  const user = await updateProfileService(req.user?._id, req.body);
  await invalidateCache("users", req.user?._id);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
};

const updateAvatar = async (req, res) => {
  const user = await updateAvatarService(req.user?._id, req.file?.path);
  await invalidateCache("users", req.user?._id);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
};

const deleteAvatar = async (req, res) => {
  const user = await deleteAvatarService(req.user?._id);
  await invalidateCache("users", req.user?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar deleted successfully"));
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await changePasswordService(req.user?._id, oldPassword, newPassword);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
};

const searchUsers = async (req, res) => {
  const { search } = req.query;
  const users = await searchUserService(search, req.user?._id);
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
};

export {
  getUser,
  updateProfile,
  updateAvatar,
  deleteAvatar,
  changePassword,
  searchUsers,
};

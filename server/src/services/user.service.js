import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { formatName } from "../utils/format.js";
import { RefreshToken } from "../models/refreshToken.model.js";

const getUserService = async (userId) => {
  const user = await User.findById(userId)
    .select("username fullName avatar bio lastSeen")
    .lean();

  if (!user) throw new ApiError(404, "User not found");
  return user;
};

const updateProfileService = async (userId, updateData) => {
  const allowedFields = ["username", "fullName", "bio"];
  const filteredData = {};

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      filteredData[key] = updateData[key];
    }
  }
  if (Object.keys(filteredData).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: filteredData },
    { new: true, runValidators: true },
  )
    .select("username fullName bio")
    .lean();

  if (!updatedUser) throw new ApiError(404, "User not found");

  return updatedUser;
};

const updateAvatarService = async (userId, avatarLocalPath) => {
  const user = await User.findById(userId).select("avatar").lean();
  if (!user) throw new ApiError(404, "User not found");

  const uploaded = await uploadOnCloudinary(avatarLocalPath, "Rynqor/avatar");
  if (!uploaded?.url || !uploaded?.publicId) {
    throw new ApiError(400, "Error uploading avatar");
  }

  const oldAvatar = user?.avatar;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: {
            url: uploaded.url,
            publicId: uploaded.publicId,
          },
        },
      },
      { new: true, runValidators: true },
    )
      .select("username fullName avatar bio")
      .lean();

    if (!updatedUser) throw new Error("DB update failed");

    if (oldAvatar?.publicId) {
      deleteFromCloudinary(oldAvatar.publicId);
    }

    return updatedUser;
  } catch (error) {
    deleteFromCloudinary(uploaded.publicId);

    throw new ApiError(500, "Avatar update failed");
  }
};

const deleteAvatarService = async (userId) => {
  const user = await User.findById(userId).select("avatar").lean();
  if (!user) throw new ApiError(404, "User not found");
  if (!user.avatar?.publicId) {
    throw new ApiError(400, "No avatar to delete");
  }

  await deleteFromCloudinary(user.avatar.publicId);

  return await User.findByIdAndUpdate(
    userId,
    { $set: { avatar: null } },
    { new: true },
  )
    .select("username fullName avatar bio")
    .lean();
};

const changePasswordService = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;

  await user.save();

  // Revoke ALL active sessions — forces re-login on every device after password change.
  await RefreshToken.deleteMany({ user: userId });

  return null;
};

const searchUserService = async (search) => {
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const query = {
    isDeleted: { $ne: true },
    $or: [
      { username: { $regex: `^${escapedSearch}`, $options: "i" } },
      { fullName: { $regex: `^${escapedSearch}`, $options: "i" } },
    ],
  };

  const users = await User.find(query)
    .select("username fullName avatar bio")
    .limit(10)
    .lean();

  return users.map((user) => ({
    _id: user._id,
    username: user.username,
    fullName: formatName(user.fullName),
    avatar: user.avatar || null,
    bio: user.bio,
  }));
};

const deleteAccountService = async (userId, password) => {
  const user = await User.findById(userId).select("+password avatar");
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(400, "Incorrect password");

  // 1. Delete Cloudinary avatar (non-blocking)
  if (user.avatar?.publicId) {
    deleteFromCloudinary(user.avatar.publicId);
  }

  // 2. Revoke all active sessions across all devices
  await RefreshToken.deleteMany({ user: userId });

  // 3. Anonymize the user document (Instagram-style soft delete)
  //    — Conversations and messages are preserved but show "Deleted Account"
  await User.findByIdAndUpdate(userId, {
    $set: {
      fullName: "Deleted Account",
      username: `deleted_${userId}`,
      email: `deleted_${userId}@deleted.local`,
      bio: "",
      avatar: null,
      isDeleted: true,
      resetOtp: null,
      resetOtpExpires: null,
      verificationOtp: null,
      verificationOtpExpires: null,
      lastSeen: null,
    },
  });
};

export {
  getUserService,
  updateProfileService,
  updateAvatarService,
  deleteAvatarService,
  changePasswordService,
  searchUserService,
  deleteAccountService,
};

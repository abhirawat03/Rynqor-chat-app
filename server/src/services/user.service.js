import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import cloudinary from "cloudinary";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { formatName } from "../utils/format.js";

const getUserService = async (userId) => {
    const user = await User.findById(userId)
        .select("username fullName avatar bio")
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
    if (!uploaded || !uploaded?.url || !uploaded?.publicId) {
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
            { new: true, runValidators: true }
        ).lean();

        if (!updatedUser) throw new Error("DB update failed");

        if (oldAvatar?.publicId) {
            cloudinary.uploader.destroy(oldAvatar.publicId)
                .catch(err => console.error("Old avatar deletion failed:", err));
        }

        return updatedUser;

    } catch (error) {
        cloudinary.uploader.destroy(uploaded.publicId)
            .catch(err => console.error("Rollback delete failed:", err));

        throw new ApiError(500, "Avatar update failed");
    }
};

const deleteAvatarService = async (userId) => {
    const user = await User.findById(userId).select("avatar").lean();
    if (!user) throw new ApiError(404, "User not found");
    if (!user.avatar?.publicId) {
        throw new ApiError(400, "No avatar to delete");
    }

    try {
        await cloudinary.uploader.destroy(user.avatar.publicId);
    } catch (err) {
        console.error("Cloudinary delete failed:", err);
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { avatar: null } },
        { new: true }
    )
    .select("-password")
    .lean();

    return updatedUser
};

const changePasswordService =
  async (
    userId,
    oldPassword,
    newPassword
  ) => {

    if (
      !oldPassword ||
      !newPassword
    ) {

      throw new ApiError(
        400,
        "Old password and new password are required"
      );

    }

    if (
      newPassword.length < 8
    ) {

      throw new ApiError(
        400,
        "Password must be at least 8 characters"
      );

    }

    if (
      oldPassword === newPassword
    ) {

      throw new ApiError(
        400,
        "New password must be different"
      );

    }

    const user =
      await User.findById(userId)
        .select("+password");

    if (!user) {

      throw new ApiError(
        404,
        "User not found"
      );

    }

    const isPasswordValid =
      await user.isPasswordCorrect(
        oldPassword
      );

    if (
      !isPasswordValid
    ) {

      throw new ApiError(
        400,
        "Old password is incorrect"
      );

    }

    user.password =
      newPassword;

    await user.save();

    return null;

  };

const searchUserService = async (search) => {
    const users = await User.find({
        $or: [
            { username: { $regex: `^${search}`, $options: "i" } },
            { fullName: { $regex: `^${search}`, $options: "i" } },
        ],
    })
        .select("username fullName avatar")
        .limit(10)
        .lean();

    return users.map(user => ({
        _id: user._id,
        username: user.username,
        fullName: formatName(user.fullName),
        avatar: user.avatar || null,
    }));
}

export {
    getUserService,
    updateProfileService,
    updateAvatarService,
    deleteAvatarService,
    changePasswordService,
    searchUserService
};

import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { formatName, formatConversation } from "../utils/format.js";
import { Message } from "../models/message.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const USER_PUBLIC_FIELDS = "_id username fullName avatar lastSeen isDeleted";
const createConversationService = async (userId, receiverId) => {
  const isSelfChat = userId.toString() === receiverId.toString();
  let conversation;

  if (isSelfChat) {
    conversation = await Conversation.findOne({
      participants: userId,
      type: "self",
    }).populate("participants", USER_PUBLIC_FIELDS);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId],
        type: "self",
      });
      await conversation.populate("participants", USER_PUBLIC_FIELDS);
    }

    const user = conversation.participants[0];

    return {
      _id: conversation._id,
      name: `${formatName(user.fullName)} (You)`,
      avatar: user.avatar || null,
    };
  }

  conversation = await Conversation.findOne({
    participants: { $all: [userId, receiverId] },
    type: "direct",
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  }).populate("participants", USER_PUBLIC_FIELDS);

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, receiverId],
      type: "direct",
    });
    await conversation.populate("participants", USER_PUBLIC_FIELDS);
  }

  const otherUser = conversation.participants.find(
    (p) => p._id.toString() !== userId.toString(),
  );

  const result = {
    _id: conversation._id,
    name: formatName(otherUser?.fullName || ""),
    avatar: otherUser?.avatar || null,
  };

  return result;
};

const getConversationService = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", USER_PUBLIC_FIELDS)
    .populate({
      path: "lastMessage",
      populate: {
        path: "senderId",
        select: "fullName username avatar",
      },
    })
    .sort({ updatedAt: -1 })
    .lean();

  const result = conversations.map((conv) => formatConversation(conv, userId));

  return result;
};

const getConversationByIdService = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).populate("participants", USER_PUBLIC_FIELDS);

  if (!conversation) {
    throw new ApiError(403, "Not allowed or conversation not found");
  }

  return formatConversation(conversation, userId);
};

const getConversationMediaService = async (userId, conversationId) => {
  // VERIFY USER BELONGS
  await getConversationByIdService(userId, conversationId);

  // FETCH MEDIA
  return await Message.find({
    conversationId,

    messageType: {
      $in: ["media", "mixed"],
    },
  })
    .populate("senderId", USER_PUBLIC_FIELDS)
    .sort({
      createdAt: -1,
    })
    .select("_id text media messageType senderId createdAt")

    .lean();
};

const createGroupConversationService = async (
  userId,
  name,
  participants,
  avatar = null,
) => {
  if (!name || !name.trim()) {
    throw new ApiError(400, "Group name is required");
  }
  if (
    !participants ||
    !Array.isArray(participants) ||
    participants.length < 2
  ) {
    throw new ApiError(400, "Group must have at least two other participants");
  }

  const allParticipants = Array.from(new Set([userId, ...participants]));

  const conversation = await Conversation.create({
    name: name.trim(),
    type: "group",
    participants: allParticipants,
    admins: [userId],
    avatar: avatar ? { url: avatar.url, publicId: avatar.publicId } : null,
  });

  await conversation.populate("participants", USER_PUBLIC_FIELDS);

  return conversation;
};

const promoteToAdminService = async (userId, conversationId, targetUserId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Only group conversations support admins");
  }

  const isAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === userId.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only admins can promote users");
  }

  const isParticipant = conversation.participants.some(
    (pId) => pId.toString() === targetUserId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(400, "User is not a participant of this group");
  }

  const isAlreadyAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === targetUserId.toString(),
  );

  if (!isAlreadyAdmin) {
    conversation.admins.push(targetUserId);
    await conversation.save();
  }

  await conversation.populate("participants", USER_PUBLIC_FIELDS);
  return conversation;
};

const removeParticipantService = async (
  userId,
  conversationId,
  targetUserId,
) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  if (conversation.type !== "group") {
    throw new ApiError(
      400,
      "Only group conversations support removing participants",
    );
  }

  const isAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === userId.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only admins can remove users");
  }

  const isParticipant = conversation.participants.some(
    (pId) => pId.toString() === targetUserId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(400, "User is not a participant of this group");
  }

  // Exclude group creator
  if (
    conversation.admins.length > 0 &&
    conversation.admins[0].toString() === targetUserId.toString()
  ) {
    throw new ApiError(
      400,
      "The group creator cannot be removed from the group",
    );
  }

  // Remove from participants and admins
  conversation.participants = conversation.participants.filter(
    (pId) => pId.toString() !== targetUserId.toString(),
  );
  conversation.admins = conversation.admins.filter(
    (adminId) => adminId.toString() !== targetUserId.toString(),
  );

  await conversation.save();
  await conversation.populate("participants", USER_PUBLIC_FIELDS);
  return conversation;
};

const demoteAdminService = async (userId, conversationId, targetUserId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Only group conversations support admins");
  }

  const isAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === userId.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only admins can demote other admins");
  }

  if (
    conversation.admins.length > 0 &&
    conversation.admins[0].toString() === targetUserId.toString()
  ) {
    throw new ApiError(400, "The group creator cannot be demoted from admin");
  }

  const targetIndex = conversation.admins.findIndex(
    (adminId) => adminId.toString() === targetUserId.toString(),
  );

  if (targetIndex === -1) {
    throw new ApiError(400, "User is not an admin of this group");
  }

  conversation.admins.splice(targetIndex, 1);
  await conversation.save();

  await conversation.populate("participants", USER_PUBLIC_FIELDS);
  return conversation;
};

const updateGroupAvatarService = async (
  userId,
  conversationId,
  { url, publicId },
) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Only group conversations support avatars");
  }

  const isAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === userId.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only admins can update group avatar");
  }

  const oldAvatar = conversation.avatar;

  conversation.avatar = {
    url,
    publicId,
  };

  await conversation.save();

  if (oldAvatar?.publicId) {
    deleteFromCloudinary(oldAvatar.publicId);
  }

  await conversation.populate("participants", USER_PUBLIC_FIELDS);
  return conversation;
};

const deleteGroupAvatarService = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Only group conversations support avatars");
  }

  const isAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === userId.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only admins can delete group avatar");
  }

  if (!conversation.avatar?.publicId) {
    throw new ApiError(400, "No group avatar to delete");
  }

  const oldAvatar = conversation.avatar;

  conversation.avatar = null;
  await conversation.save();

  await deleteFromCloudinary(oldAvatar.publicId);

  await conversation.populate("participants", USER_PUBLIC_FIELDS);
  return conversation;
};

const updateGroupNameService = async (userId, conversationId, name) => {
  if (!name || !name.trim()) {
    throw new ApiError(400, "Group name is required");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Only group conversations support name updates");
  }

  const isAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === userId.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only admins can update group name");
  }

  conversation.name = name.trim();
  await conversation.save();

  await conversation.populate("participants", USER_PUBLIC_FIELDS);
  return conversation;
};

const addParticipantsService = async (
  userId,
  conversationId,
  participantIds,
) => {
  if (
    !participantIds ||
    !Array.isArray(participantIds) ||
    participantIds.length === 0
  ) {
    throw new ApiError(400, "At least one participant to add is required");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  if (conversation.type !== "group") {
    throw new ApiError(
      400,
      "Only group conversations support adding participants",
    );
  }

  const isAdmin = conversation.admins.some(
    (adminId) => adminId.toString() === userId.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only admins can add participants");
  }

  // Filter out user IDs that are already participants
  const newParticipantIds = participantIds.filter(
    (pId) =>
      !conversation.participants.some(
        (memberId) => memberId.toString() === pId.toString(),
      ),
  );

  if (newParticipantIds.length === 0) {
    throw new ApiError(400, "All specified users are already in this group");
  }

  conversation.participants.push(...newParticipantIds);
  await conversation.save();

  await conversation.populate("participants", USER_PUBLIC_FIELDS);
  return conversation;
};

const leaveGroupService = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(
      404,
      "Conversation not found or you are not a participant",
    );
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Only group conversations support leaving");
  }

  const isCreator =
    conversation.admins.length > 0 &&
    conversation.admins[0].toString() === userId.toString();

  // Remove user from participants
  conversation.participants = conversation.participants.filter(
    (pId) => pId.toString() !== userId.toString(),
  );

  // Remove user from admins
  conversation.admins = conversation.admins.filter(
    (adminId) => adminId.toString() !== userId.toString(),
  );

  // If group is empty, delete it
  if (conversation.participants.length === 0) {
    if (conversation.avatar?.publicId) {
      await deleteFromCloudinary(conversation.avatar.publicId);
    }

    // Delete all messages and their media
    const messages = await Message.find({ conversationId });
    for (const msg of messages) {
      if (msg.media && msg.media.length > 0) {
        for (const med of msg.media) {
          if (med.publicId) {
            await deleteFromCloudinary(med.publicId);
          }
        }
      }
    }

    await Message.deleteMany({ conversationId });
    await Conversation.deleteOne({ _id: conversationId });
    return { deleted: true };
  }

  // If the leaving user was the main admin/creator and there are members left
  if (isCreator) {
    if (conversation.admins.length > 0) {
      // Because we filtered out the leaving creator, the new admins list already contains the next admin at index 0.
    } else {
      // Promote the first available participant to admin
      conversation.admins.push(conversation.participants[0]);
    }
  }

  await conversation.save();
  await conversation.populate("participants", USER_PUBLIC_FIELDS);
  return { deleted: false, conversation };
};

const deleteGroupService = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  if (conversation.type !== "group") {
    throw new ApiError(400, "Only group conversations can be deleted");
  }

  const isCreator =
    conversation.admins.length > 0 &&
    conversation.admins[0].toString() === userId.toString();

  if (!isCreator) {
    throw new ApiError(
      403,
      "Only the group creator (main admin) can delete the group",
    );
  }

  if (conversation.avatar?.publicId) {
    await deleteFromCloudinary(conversation.avatar.publicId);
  }

  // Delete all messages and their media
  const messages = await Message.find({ conversationId });
  for (const msg of messages) {
    if (msg.media && msg.media.length > 0) {
      for (const med of msg.media) {
        if (med.publicId) {
          await deleteFromCloudinary(med.publicId);
        }
      }
    }
  }

  await Message.deleteMany({ conversationId });
  await Conversation.deleteOne({ _id: conversationId });

  return { success: true };
};

export {
  createConversationService,
  getConversationService,
  getConversationByIdService,
  getConversationMediaService,
  createGroupConversationService,
  promoteToAdminService,
  removeParticipantService,
  updateGroupAvatarService,
  deleteGroupAvatarService,
  updateGroupNameService,
  addParticipantsService,
  demoteAdminService,
  leaveGroupService,
  deleteGroupService,
};

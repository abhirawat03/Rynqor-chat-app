import {
  createConversationService,
  getConversationByIdService,
  getConversationMediaService,
  getConversationService,
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
} from "../services/conversation.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

const createSystemMessage = async (conversationId, senderId, text) => {
  const systemMsg = await Message.create({
    conversationId,
    senderId,
    text,
    messageType: "system",
    status: "read",
  });
  await systemMsg.populate("senderId", "fullName username avatar");
  return systemMsg;
};

const getCallerName = async (userId) => {
  const user = await User.findById(userId).select("fullName");
  return user?.fullName || "Someone";
};

const createConversation = async (req, res) => {
  const userId = req.user?._id;
  const { receiverId } = req.body;

  const conversation = await createConversationService(userId, receiverId);
  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Conversation created successfully"),
    );
};

const getConversation = async (req, res) => {
  const userId = req.user?._id;

  const conversations = await getConversationService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversations, "Conversations fetched successfully"),
    );
};

const getConversationById = async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await getConversationByIdService(userId, conversationId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        conversation,
        "Conversation fetched by Id successfully",
      ),
    );
};

const getConversationMedia = async (req, res) => {
  const userId = req.user._id;

  const { conversationId } = req.params;

  const media = await getConversationMediaService(userId, conversationId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, media, "Conversation media fetched successfully"),
    );
};

const createGroupConversation = async (req, res) => {
  const userId = req.user?._id;
  const { name, participants, avatar } = req.body;

  const conversation = await createGroupConversationService(
    userId,
    name,
    participants,
    avatar,
  );

  // Create system message
  const callerName = await getCallerName(userId);
  const systemMsgText = `${callerName} created the group "${name}"`;
  const systemMsg = await createSystemMessage(
    conversation._id,
    userId,
    systemMsgText,
  );

  // Broadcast to participants
  const io = req.app.get("io");
  if (io) {
    // Emit to room
    io.to(conversation._id.toString()).emit("new_message", {
      message: systemMsg,
      conversation,
    });

    // Also emit to all participants' individual personal rooms
    conversation.participants.forEach((member) => {
      io.to(member._id.toString()).emit("new_message", {
        message: systemMsg,
        conversation,
      });
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        conversation,
        "Group conversation created successfully",
      ),
    );
};

const promoteToAdmin = async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const { targetUserId } = req.body;

  const conversation = await promoteToAdminService(
    userId,
    conversationId,
    targetUserId,
  );

  // Create system message
  const targetUser = await User.findById(targetUserId);
  const callerName = await getCallerName(userId);
  const systemMsgText = `${callerName} promoted ${targetUser?.fullName || "a member"} to Admin`;
  const systemMsg = await createSystemMessage(
    conversationId,
    userId,
    systemMsgText,
  );

  // Broadcast
  const io = req.app.get("io");
  if (io) {
    io.to(conversationId).emit("new_message", {
      message: systemMsg,
      conversation,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "User promoted to admin successfully"),
    );
};

const removeParticipant = async (req, res) => {
  const userId = req.user._id;
  const { conversationId, participantId } = req.params;

  const conversation = await removeParticipantService(
    userId,
    conversationId,
    participantId,
  );

  // Create system message
  const targetUser = await User.findById(participantId);
  const callerName = await getCallerName(userId);
  const systemMsgText = `${callerName} removed ${targetUser?.fullName || "a member"} from the group`;
  const systemMsg = await createSystemMessage(
    conversationId,
    userId,
    systemMsgText,
  );

  // Broadcast
  const io = req.app.get("io");
  if (io) {
    io.to(conversationId).emit("new_message", {
      message: systemMsg,
      conversation,
    });

    // Emit to the removed participant's personal room
    io.to(participantId.toString()).emit("new_message", {
      message: systemMsg,
      conversation,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Participant removed successfully"),
    );
};

const updateGroupAvatar = async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const { url, publicId } = req.body;

  if (!url || !publicId) {
    return res.status(400).json({
      success: false,
      message: "url and publicId are required",
    });
  }

  const conversation = await updateGroupAvatarService(
    userId,
    conversationId,
    { url, publicId },
  );

  // Create system message
  const callerName = await getCallerName(userId);
  const systemMsgText = `${callerName} updated the group profile photo`;
  const systemMsg = await createSystemMessage(
    conversationId,
    userId,
    systemMsgText,
  );

  // Broadcast
  const io = req.app.get("io");
  if (io) {
    io.to(conversationId).emit("new_message", {
      message: systemMsg,
      conversation,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Group avatar updated successfully"),
    );
};

const deleteGroupAvatar = async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await deleteGroupAvatarService(userId, conversationId);

  // Create system message
  const callerName = await getCallerName(userId);
  const systemMsgText = `${callerName} removed the group profile photo`;
  const systemMsg = await createSystemMessage(
    conversationId,
    userId,
    systemMsgText,
  );

  // Broadcast
  const io = req.app.get("io");
  if (io) {
    io.to(conversationId).emit("new_message", {
      message: systemMsg,
      conversation,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Group avatar deleted successfully"),
    );
};

const updateGroupName = async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const { name } = req.body;

  const conversation = await updateGroupNameService(
    userId,
    conversationId,
    name,
  );

  // Create system message
  const callerName = await getCallerName(userId);
  const systemMsgText = `${callerName} renamed the group to "${name}"`;
  const systemMsg = await createSystemMessage(
    conversationId,
    userId,
    systemMsgText,
  );

  // Broadcast
  const io = req.app.get("io");
  if (io) {
    io.to(conversationId).emit("new_message", {
      message: systemMsg,
      conversation,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Group name updated successfully"),
    );
};

const addParticipants = async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;
  const { participantIds } = req.body;

  const conversation = await addParticipantsService(
    userId,
    conversationId,
    participantIds,
  );

  // Create system message
  const addedUsers = await User.find({ _id: { $in: participantIds } }).select(
    "fullName",
  );
  const addedNames = addedUsers.map((u) => u.fullName).join(", ");
  const callerName = await getCallerName(userId);
  const systemMsgText = `${callerName} added ${addedNames || "new members"} to the group`;
  const systemMsg = await createSystemMessage(
    conversationId,
    userId,
    systemMsgText,
  );

  // Broadcast
  const io = req.app.get("io");
  if (io) {
    io.to(conversationId).emit("new_message", {
      message: systemMsg,
      conversation,
    });

    // Emit to each added participant's personal room
    participantIds.forEach((pId) => {
      io.to(pId.toString()).emit("new_message", {
        message: systemMsg,
        conversation,
      });
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Participants added successfully"),
    );
};

const demoteAdmin = async (req, res) => {
  const userId = req.user._id;
  const { conversationId, adminId } = req.params;

  const conversation = await demoteAdminService(
    userId,
    conversationId,
    adminId,
  );

  // Create system message
  const targetUser = await User.findById(adminId);
  const callerName = await getCallerName(userId);
  const systemMsgText = `${callerName} dismissed ${targetUser?.fullName || "an admin"} as Admin`;
  const systemMsg = await createSystemMessage(
    conversationId,
    userId,
    systemMsgText,
  );

  // Broadcast
  const io = req.app.get("io");
  if (io) {
    io.to(conversationId).emit("new_message", {
      message: systemMsg,
      conversation,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        conversation,
        "User demoted from admin successfully",
      ),
    );
};

const leaveGroup = async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  const result = await leaveGroupService(userId, conversationId);

  // Create system message only if the group wasn't deleted
  if (!result.deleted && result.conversation) {
    const callerName = await getCallerName(userId);
    const systemMsgText = `${callerName} left the group`;
    const systemMsg = await createSystemMessage(
      conversationId,
      userId,
      systemMsgText,
    );

    // Broadcast to remaining room members
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("new_message", {
        message: systemMsg,
        conversation: result.conversation,
      });
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.deleted
          ? "Group deleted on last participant leaving"
          : "Left group successfully",
      ),
    );
};

const deleteGroup = async (req, res) => {
  const userId = req.user._id;
  const { conversationId } = req.params;

  await deleteGroupService(userId, conversationId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Group deleted successfully"));
};

export {
  createConversation,
  getConversation,
  getConversationById,
  getConversationMedia,
  createGroupConversation,
  promoteToAdmin,
  removeParticipant,
  updateGroupAvatar,
  deleteGroupAvatar,
  updateGroupName,
  addParticipants,
  demoteAdmin,
  leaveGroup,
  deleteGroup,
};

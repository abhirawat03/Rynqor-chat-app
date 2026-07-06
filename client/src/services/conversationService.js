import Api from "./api.js";
import { uploadSingleToCloud } from "./uploadService.js";

const createConversation = async (receiverId) => {
  const res = await Api.post(`/conversations`, {
    receiverId,
  });
  return res.data.data;
};
const getConversations = async () => {
  const res = await Api.get("/conversations");
  return res.data.data;
};

const getConversationById = async (conversationId) => {
  if (!conversationId) throw new Error("Missing conversationId");
  const res = await Api.get(`/conversations/${conversationId}`);
  return res.data.data;
};

const getConversationMedia = async (conversationId) => {
  if (!conversationId) throw new Error("Missing conversationId");
  const res = await Api.get(`/conversations/${conversationId}/media`);
  return res.data.data;
};

const createGroupConversation = async ({
  name,
  participants,
  avatar = null,
}) => {
  const res = await Api.post(`/conversations/group`, {
    name,
    participants,
    avatar,
  });
  return res.data.data;
};

const promoteToAdmin = async ({ conversationId, targetUserId }) => {
  if (!conversationId) throw new Error("Missing conversationId");
  const res = await Api.put(`/conversations/${conversationId}/admins`, {
    targetUserId,
  });
  return res.data.data;
};

const demoteAdmin = async ({ conversationId, adminId }) => {
  if (!conversationId) throw new Error("Missing conversationId");
  if (!adminId) throw new Error("Missing adminId");
  const res = await Api.delete(
    `/conversations/${conversationId}/admins/${adminId}`,
  );
  return res.data.data;
};

const removeParticipant = async ({ conversationId, participantId }) => {
  if (!conversationId) throw new Error("Missing conversationId");
  if (!participantId) throw new Error("Missing participantId");
  const res = await Api.delete(
    `/conversations/${conversationId}/participants/${participantId}`,
  );
  return res.data.data;
};

const updateGroupAvatar = async ({ conversationId, file }) => {
  if (!conversationId) throw new Error("Missing conversationId");

  const { url, publicId } = await uploadSingleToCloud(file, "avatar");

  const res = await Api.patch(
    `/conversations/${conversationId}/avatar`,
    {
      url,
      publicId,
    }
  );
  return res.data.data;
};

const deleteGroupAvatar = async (conversationId) => {
  if (!conversationId) throw new Error("Missing conversationId");
  const res = await Api.delete(`/conversations/${conversationId}/avatar`);
  return res.data.data;
};

const updateGroupName = async ({ conversationId, name }) => {
  if (!conversationId) throw new Error("Missing conversationId");
  const res = await Api.patch(`/conversations/${conversationId}/name`, {
    name,
  });
  return res.data.data;
};

const addParticipants = async ({ conversationId, participantIds }) => {
  if (!conversationId) throw new Error("Missing conversationId");
  const res = await Api.post(`/conversations/${conversationId}/participants`, {
    participantIds,
  });
  return res.data.data;
};

const leaveGroup = async (conversationId) => {
  if (!conversationId) throw new Error("Missing conversationId");
  const res = await Api.post(`/conversations/${conversationId}/leave`);
  return res.data.data;
};

const deleteGroup = async (conversationId) => {
  if (!conversationId) throw new Error("Missing conversationId");
  const res = await Api.delete(`/conversations/${conversationId}`);
  return res.data.data;
};

export {
  createConversation,
  getConversations,
  getConversationById,
  getConversationMedia,
  createGroupConversation,
  promoteToAdmin,
  demoteAdmin,
  removeParticipant,
  updateGroupAvatar,
  deleteGroupAvatar,
  updateGroupName,
  addParticipants,
  leaveGroup,
  deleteGroup,
};

export const formatName = (name) => {
  if (typeof name !== "string") return "";

  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const formatConversation = (conversation, userId) => {
  if (!conversation) return null;

  const isSelf = conversation.type === "self";
  const isGroup = conversation.type === "group";

  const base = {
    _id: conversation._id,
    participants: conversation.participants,
    type: conversation.type,
  };

  if (conversation.lastMessage !== undefined) {
    base.lastMessage = conversation.lastMessage || null;
  }
  if (conversation.updatedAt !== undefined) {
    base.updatedAt = conversation.updatedAt;
  }

  if (isSelf) {
    const user = conversation.participants?.[0];

    return {
      ...base,
      name: user ? `${formatName(user.fullName)} (You)` : "Deleted Account (You)",
      avatar: user?.avatar || null,
    };
  }

  if (isGroup) {
    return {
      ...base,
      name: conversation.name,
      avatar: conversation.avatar || null,
      admins: conversation.admins || [],
    };
  }

  const otherUser = conversation.participants?.find(
    (p) => p._id.toString() !== userId.toString(),
  );

  return {
    ...base,
    name: formatName(otherUser?.fullName || ""),
    avatar: otherUser?.avatar || null,
  };
};

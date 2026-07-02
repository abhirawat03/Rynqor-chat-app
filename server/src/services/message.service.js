import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { getConversationByIdService } from "./conversation.service.js";
import { invalidateCache } from "../middleware/cache.middleware.js";

// Orchestrates message creation and conversation updates within an atomic MongoDB transaction
// to guarantee consistency (preventing orphaned messages or outdated conversation references).
const sendMessageService = async (userId, payload) => {
  const { conversationId, text = "", media = [] } = payload;
  await getConversationByIdService(userId, conversationId);
  let messageType = "text";

  if (media.length > 0 && text.trim()) {
    messageType = "mixed";
  } else if (media.length > 0) {
    messageType = "media";
  }

  // Create a database session to execute writes atomically
  const session = await mongoose.startSession();
  let message;

  try {
    // withTransaction automatically handles retry logic on transient errors and rolls back on failure
    await session.withTransaction(async () => {
      const [newMessage] = await Message.create(
        [
          {
            _id: payload._id,
            conversationId,
            senderId: userId,
            text: text.trim() || "",
            media,
            messageType,
          },
        ],
        { session },
      );

      message = newMessage;

      // Maintain referential integrity by linking the last message to the conversation
      await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: message._id },
        { session },
      );
    });

    // Invalidate shared media cache when a new media message is saved
    if (media.length > 0) {
      invalidateCache("media", conversationId).catch((err) =>
        console.error("❌ Failed to invalidate media cache:", err.message)
      );
    }

    return message;
  } catch (error) {
    console.error("❌ Send message transaction failed, rolling back:", error);
    throw error;
  } finally {
    // Release resources back to the connection pool
    session.endSession();
  }
};

// Uses cursor-based pagination (based on ObjectId chronology) to avoid skip/limit offset gaps
// and duplicate message items if new messages arrive during user scrolling.
const getMessageService = async (userId, conversationId, cursor) => {
  await getConversationByIdService(userId, conversationId);

  const query = {
    conversationId,
  };

  if (cursor) {
    // MongoDB ObjectIds embed a timestamp, allowing safe chronological filtering
    query._id = { $lt: cursor };
  }
  const PAGE_SIZE = 20;
  const messages = await Message.find(query)
    .sort({ _id: -1 })
    // Request PAGE_SIZE + 1 to determine if there is a next page without a separate count query
    .limit(PAGE_SIZE + 1)
    .populate("senderId", "username fullName avatar")
    .lean();

  const hasMore = messages.length > PAGE_SIZE;

  // Trim the extra element used for the "hasMore" boundary check
  if (hasMore) {
    messages.pop();
  }

  const nextCursor =
    messages.length > 0 ? messages[messages.length - 1]._id : null;

  return {
    messages: messages.reverse(), // Restore standard forward chronological order for UI display
    nextCursor,
    hasMore,
  };
};

export { sendMessageService, getMessageService };

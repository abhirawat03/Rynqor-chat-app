import mongoose from "mongoose";
import { sendMessageService } from "../services/message.service.js";
import { getConversationByIdService } from "../services/conversation.service.js";
import { getUserService } from "../services/user.service.js";
import { getRedisClient } from "../config/redisClient.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

// Fallbacks for when Redis client is offline/unavailable
const localOnlineUsers = new Map();
const socketLimits = new Map();

export const registerHandlers = async (io, socket) => {
  const userId = socket.user?._id?.toString();
  if (!userId) return;

  // Personal channel for private alerts and cross-tab triggers
  socket.join(userId);
  console.log(`🔌 Socket ${socket.id} joined personal room ${userId}`);

  // Cache user details on the socket instance to avoid database queries on every message
  try {
    const user = await getUserService(userId);
    socket.userProfile = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar || null,
    };
  } catch (err) {
    console.error("❌ Failed to fetch user details for socket connection:", err.message);
  }

  // Rate limiter checking method to defend server from event flooding
  const checkRateLimit = (action, maxEvents, windowMs) => {
    const now = Date.now();
    if (!socketLimits.has(userId)) {
      socketLimits.set(userId, { send_message: [], mark_read: [], typing: 0 });
    }
    const limits = socketLimits.get(userId);

    if (action === "typing") {
      if (now - limits.typing < windowMs) return false;
      limits.typing = now;
      return true;
    }

    const history = limits[action] || [];
    const recent = history.filter((time) => now - time < windowMs);
    if (recent.length >= maxEvents) return false;
    recent.push(now);
    limits[action] = recent;
    return true;
  };

  // ---------------------------------------------------
  // ONLINE USERS & PRESENCE (Redis scaling support)
  // ---------------------------------------------------
  const redisClient = getRedisClient();

  if (redisClient) {
    try {
      // Check if user was already active on another open browser tab
      const wasOnline = await redisClient.sIsMember("online_users", userId);

      await redisClient.sAdd(`user:sockets:${userId}`, socket.id);
      await redisClient.sAdd("online_users", userId);

      console.log(`🟢 User online (Redis): ${userId} (socket: ${socket.id})`);

      // Emit all currently connected users back to the client
      const allOnline = await redisClient.sMembers("online_users");
      socket.emit("online_users", allOnline);

      // Only notify others if this is the user's first active tab/session
      if (!wasOnline) {
        socket.broadcast.emit("user_online", { userId });
      }
    } catch (err) {
      console.error("❌ Redis presence error:", err.message);
    }
  } else {
    // Fallback: Local memory Maps for single-node development
    if (!localOnlineUsers.has(userId)) {
      localOnlineUsers.set(userId, new Set());
    }
    localOnlineUsers.get(userId).add(socket.id);

    console.log(`🟢 User online (Local): ${userId} (socket: ${socket.id})`);

    socket.emit("online_users", Array.from(localOnlineUsers.keys()));
    socket.broadcast.emit("user_online", { userId });
  }

  // ---------------------------------------------------
  // AUTO JOIN ACTIVE ROOMS
  // ---------------------------------------------------
  // Automatically subscribe the client socket to all Mongoose conversations they participate in.
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).select("_id");

    conversations.forEach((conv) => {
      socket.join(conv._id.toString());
    });

    console.log(`✅ ${userId} auto-joined ${conversations.length} conversations`);
  } catch (err) {
    console.log("❌ auto join error:", err.message);
  }

  // ---------------------------------------------------
  // JOIN CONVERSATION
  // ---------------------------------------------------
  socket.on("join_conversation", async (conversationId) => {
    try {
      await getConversationByIdService(userId, conversationId);
      socket.join(conversationId);
      console.log(`✅ ${userId} joined ${conversationId}`);
    } catch (err) {
      console.log("❌ join error:", err.message);
      socket.emit("error", "Not allowed to join this conversation");
    }
  });

  // ---------------------------------------------------
  // SEND MESSAGE
  // ---------------------------------------------------
  socket.on("send_message", async (payload) => {
    if (!checkRateLimit("send_message", 10, 10000)) {
      socket.emit("error", "Rate limit exceeded. Please wait before sending more messages.");
      return;
    }

    try {
      const { conversationId, text, media = [], clientTempId } = payload;
      if (!conversationId) return;

      const hasText = text && text.trim();
      const hasMedia = media.length > 0;
      if (!hasText && !hasMedia) return;

      // Verify membership using in-memory socket rooms instead of Mongoose query
      if (!socket.rooms.has(conversationId)) {
        socket.emit("error", "Not allowed to send messages to this conversation");
        return;
      }

      // Generate ObjectId and format message in memory for instant socket transmission
      const messageId = new mongoose.Types.ObjectId();
      let messageType = "text";
      if (media.length > 0 && text && text.trim()) {
        messageType = "mixed";
      } else if (media.length > 0) {
        messageType = "media";
      }

      const senderDetails = socket.userProfile || {
        _id: userId,
        username: "User",
        fullName: "User",
        avatar: null,
      };

      const outgoingMessage = {
        _id: messageId.toString(),
        conversationId,
        senderId: senderDetails,
        text: text ? text.trim() : "",
        media,
        messageType,
        status: "sent",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientTempId,
      };

      const conversation = await Conversation.findById(conversationId)
        .populate("participants", "fullName avatar username")
        .lean();

      // Emit socket message instantly to all recipients (optimistic broadcast)
      socket.emit("message_sent", outgoingMessage);
      socket.to(conversationId).emit("new_message", {
        message: outgoingMessage,
        conversation,
      });

      // Persist the message in the database asynchronously
      await sendMessageService(userId, {
        _id: messageId,
        conversationId,
        text: text ? text.trim() : "",
        media,
      });
      console.log(`💾 Saved message ${messageId} directly to DB.`);
    } catch (err) {
      console.log("❌ send_message error:", err.message);
      socket.emit("message_failed", {
        clientTempId: payload?.clientTempId,
      });
    }
  });

  // ---------------------------------------------------
  // MARK READ
  // ---------------------------------------------------
  socket.on("mark_read", async ({ conversationId, lastReadAt }) => {
    if (!checkRateLimit("mark_read", 5, 5000)) return;

    try {
      if (!conversationId) return;
      if (!socket.rooms.has(conversationId)) return;

      const readAt = lastReadAt ? new Date(lastReadAt) : new Date();

      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: userId },
          status: { $ne: "read" },
          createdAt: { $lte: readAt },
        },
        {
          $set: { status: "read", readAt },
        },
      );

      socket.to(conversationId).emit("messages_read", {
        conversationId,
        readBy: userId,
        lastReadAt: readAt,
      });
    } catch (err) {
      console.log("❌ mark_read error:", err.message);
    }
  });

  // ---------------------------------------------------
  // TYPING STATE
  // ---------------------------------------------------
  socket.on("typing", async ({ conversationId }) => {
    if (!checkRateLimit("typing", 1, 2000)) return;

    try {
      if (!socket.rooms.has(conversationId)) return;
      socket.to(conversationId).emit("typing", { userId, conversationId });
    } catch (err) {
      console.log("❌ typing error:", err.message);
    }
  });

  socket.on("stop_typing", async ({ conversationId }) => {
    try {
      if (!socket.rooms.has(conversationId)) return;

      if (socketLimits.has(userId)) {
        socketLimits.get(userId).typing = 0;
      }

      socket.to(conversationId).emit("stop_typing", { userId, conversationId });
    } catch (err) {
      console.log("❌ stop_typing error:", err.message);
    }
  });

  // ---------------------------------------------------
  // DISCONNECT & PRESENCE CLEANUP
  // ---------------------------------------------------
  socket.on("disconnect", async () => {
    const lastSeen = new Date();

    if (redisClient) {
      try {
        await redisClient.sRem(`user:sockets:${userId}`, socket.id);
        const tabCount = await redisClient.sCard(`user:sockets:${userId}`);

        // If no open tabs remain for this user, declare them offline
        if (tabCount === 0) {
          await redisClient.sRem("online_users", userId);
          await redisClient.del(`user:sockets:${userId}`);
          socketLimits.delete(userId);

          // Persist lastSeen to DB so it survives server restarts
          await User.findByIdAndUpdate(userId, { lastSeen });

          socket.broadcast.emit("user_offline", {
            userId,
            lastSeen,
          });
        }
      } catch (err) {
        console.error("❌ Redis disconnect presence error:", err.message);
      }
    } else {
      const sockets = localOnlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          localOnlineUsers.delete(userId);
          socketLimits.delete(userId);

          // Persist lastSeen to DB
          await User.findByIdAndUpdate(userId, { lastSeen });

          socket.broadcast.emit("user_offline", {
            userId,
            lastSeen,
          });
        }
      }
    }
    console.log("🔴 User offline:", userId);
  });
};

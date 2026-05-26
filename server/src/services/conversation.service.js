import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { formatName } from "../utils/format.js";
import { Message } from "../models/message.model.js";

const createConversationService = async (userId, receiverId) => {
    const isSelfChat = userId.toString() === receiverId.toString();
    // if(userId === receiverId) throw new ApiError(400, "Cannot chat with yourself");

    let conversation;

    if (isSelfChat) {
        conversation = await Conversation.findOne({
            participants: userId,
            type: "self"
        }).populate("participants", "_id username fullName avatar");

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId],
                type: "self",
            });
            await conversation.populate("participants", "_id username fullName avatar");
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
    }).populate("participants", "_id username fullName avatar");

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [userId, receiverId],
            type: "direct",
        })
        await conversation.populate("participants", "_id username fullName avatar");
    }

    const otherUser = conversation.participants.find(
        (p) => p._id.toString() !== userId.toString()
    );

    const result = {
        _id: conversation._id,
        name: formatName(otherUser?.fullName || ""),
        avatar: otherUser?.avatar || null,
    }

    return result;
};

const getConversationService = async (userId) => {
    const conversations = await Conversation.find({
        participants: userId,
    })
        .populate("participants", "_id username fullName avatar")
        .populate({
    path: "lastMessage",
    populate: {
        path: "senderId",
        select: "fullName username avatar",
    },
})
        .sort({ updatedAt: -1 })
        .lean();

    const result = conversations.map((conv) => {
        const isSelf = conv.type === "self";

        if (isSelf) {
            const user = conv.participants[0];

            return {
                _id: conv._id,
                name: `${formatName(user.fullName)} (You)`,
                avatar: user.avatar || null,
                participants: conv.participants,
                lastMessage: conv.lastMessage || null,
                updatedAt: conv.updatedAt,
            };
        }

        const otherUser = conv.participants.find(
            (p) => p._id.toString() !== userId.toString()
        );

        return {
            _id: conv._id,
            name: formatName(otherUser?.fullName || ""),
            avatar: otherUser?.avatar || null,
            participants: conv.participants,
            lastMessage: conv.lastMessage || null,
            updatedAt: conv.updatedAt,
        };
    });

    return result;
};

const getConversationByIdService = async (userId, conversationId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new ApiError(400, "Invalid conversationId");
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
    }).populate("participants", "_id username fullName avatar");

    if (!conversation) {
        throw new ApiError(403, "Not allowed or conversation not found");
    }

    const isSelf = conversation.type === "self";

    if (isSelf) {
        const user = conversation.participants[0];

        return {
            _id: conversation._id,
            name: `${formatName(user.fullName)} (You)`,
            avatar: user.avatar || null,
            participants: conversation.participants,
            type: conversation.type,
        };
    }

    const otherUser = conversation.participants.find(
        (p) => p._id.toString() !== userId.toString()
    );

    return {
        _id: conversation._id,
        name: formatName(otherUser?.fullName || ""),
        avatar: otherUser?.avatar || null,
        participants: conversation.participants,
        type: conversation.type,
    };
};

const getConversationMediaService =
  async (
    userId,
    conversationId,
  ) => {

    // VERIFY USER BELONGS
    const conversation =
      await Conversation.findOne({

        _id: conversationId,

        participants: userId,

      });

    if (!conversation) {
      throw new Error(
        "Unauthorized access"
      );
    }

    // FETCH MEDIA
    const mediaMessages =
      await Message.find({

        conversationId,

        messageType: {
          $in: [
            "media",
            "mixed",
          ],
        },

      })

        .populate(
          "senderId",
          `
          _id
          username
          fullName
          avatar
          `
        )

        .sort({
          createdAt: -1,
        })

        .select(`
          _id
          text
          media
          messageType
          senderId
          createdAt
        `)

        .lean();

    return mediaMessages;
  };

export {
    createConversationService,
    getConversationService,
    getConversationByIdService,
    getConversationMediaService
};

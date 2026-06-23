import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { getConversationByIdService } from "./conversation.service.js";

const sendMessageService = async (userId, payload) => {
    const { conversationId, text = "", media = [] } = payload;
    await getConversationByIdService(userId, conversationId);
    let messageType = "text";

    if (media.length > 0 && text.trim()) {
        messageType = "mixed";
    }
    else if (media.length > 0) {
        messageType = "media";
    }

    const session = await mongoose.startSession();
    let message;

    try {
        await session.withTransaction(async () => {
            const [newMessage] = await Message.create(
                [
                    {
                        conversationId,
                        senderId: userId,
                        text: text.trim() || "",
                        media,
                        messageType,
                    },
                ],
                { session }
            );

            message = newMessage;

            await Conversation.findByIdAndUpdate(
                conversationId,
                { lastMessage: message._id },
                { session }
            );
        });

        return message;

    } catch (error) {
        console.error("❌ Send message transaction failed, rolling back:", error);
        throw error;
    } finally {
        session.endSession();
    }
}

const getMessageService = async (userId, conversationId, cursor) => {
    await getConversationByIdService(userId, conversationId);

    const query = {
        conversationId
    }

    if (cursor) {
        query._id = { $lt: cursor }; 
    }
    const PAGE_SIZE = 20;
    const messages = await Message.find(query)  
        .sort({ _id: -1 })
        .limit(PAGE_SIZE + 1)
        .populate("senderId", "username fullName avatar")
        .lean();

    const hasMore =
    messages.length > PAGE_SIZE;

    if (hasMore) {
        messages.pop();
    }

    const nextCursor =
        messages.length > 0
            ? messages[messages.length - 1]._id
            : null;

    return {
        messages: messages.reverse(),
        nextCursor,
        hasMore,
    };
}

export { sendMessageService, getMessageService }
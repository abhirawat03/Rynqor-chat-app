import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
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
    const message = await Message.create({
        conversationId,
        senderId: userId,
        text: text.trim() || "",
        media,
        messageType
    });

    await Conversation.findByIdAndUpdate(conversationId, {
        // lastMessage: {
        //     text: message.text,
        //     senderId: userId,
        //     createdAt: message.createdAt,
        // },
        lastMessage: message._id,
    });

    return message;
}

const getMessageService = async (userId, conversationId, cursor) => {
    await getConversationByIdService(userId, conversationId);

    const query = {
        conversationId
    }

    if (cursor) {
        query._id = { $lt: cursor }; //older message
    }

    const messages = await Message.find(query)
        .sort({ _id: -1 })
        .limit(20)
        .populate("senderId", "username fullName avatar")
        .lean();

    const nextCursor =
        messages.length
            ? messages[
                  messages.length - 1
              ]._id
            : null;

    return {
        messages: messages.reverse(),
        nextCursor,
        hasMore: messages.length === 20,
    };
}

export { sendMessageService, getMessageService }
import { sendMessageService } from "../services/message.service.js";
import { getConversationByIdService } from "../services/conversation.service.js";

import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

const onlineUsers = new Map();

export const registerHandlers = async (
    io,
    socket
) => {

    const userId =
        socket.user?._id?.toString();

    if (!userId) {
        return;
    }

    // ---------------------------------------------------
    // ONLINE USERS
    // ---------------------------------------------------

    if (!onlineUsers.has(userId)) {

        onlineUsers.set(
            userId,
            new Set()
        );
    }

    onlineUsers
        .get(userId)
        .add(socket.id);

    console.log(
        "🟢 User online:",
        userId
    );

    // ---------------------------------------------------
    // AUTO JOIN CONVERSATIONS
    // ---------------------------------------------------

    try {

        const conversations =
            await Conversation.find({
                participants: userId,
            }).select("_id");

        conversations.forEach(
            (conv) => {

                socket.join(
                    conv._id.toString()
                );
            }
        );

        console.log(
            `✅ ${userId} auto-joined ${conversations.length} conversations`
        );

    } catch (err) {

        console.log(
            "❌ auto join error:",
            err.message
        );
    }

    // ---------------------------------------------------
    // PRESENCE
    // ---------------------------------------------------

    socket.emit(
        "online_users",
        Array.from(
            onlineUsers.keys()
        )
    );

    socket.broadcast.emit(
        "user_online",
        { userId }
    );

    // ---------------------------------------------------
    // JOIN CONVERSATION
    // ---------------------------------------------------

    socket.on(
        "join_conversation",
        async (conversationId) => {

            try {

                await getConversationByIdService(
                    userId,
                    conversationId
                );

                socket.join(
                    conversationId
                );

                console.log(
                    `✅ ${userId} joined ${conversationId}`
                );

            } catch (err) {

                console.log(
                    "❌ join error:",
                    err.message
                );

                socket.emit(
                    "error",
                    "Not allowed to join this conversation"
                );
            }
        }
    );

    // ---------------------------------------------------
    // SEND MESSAGE
    // ---------------------------------------------------

    socket.on(
        "send_message",
        async (payload) => {

            try {

                const {
                    conversationId,
                    text,
                    media = [],
                    clientTempId,
                } = payload;

                if (
                    !conversationId
                ) {
                    return;
                }

                const hasText =
                    text.trim();

                const hasMedia =
                    media.length > 0;

                if (
                    !hasText &&
                    !hasMedia
                ) {
                    return;
                }

                // validate membership
                // await getConversationByIdService(
                //     userId,
                //     conversationId
                // );
                
                const savedMessage =
                    await sendMessageService(
                        userId,
                        {
                            conversationId,
                            text,
                            media,
                        }
                    );

                const populatedMessage =
                    await savedMessage.populate(
                        "senderId",
                        "fullName avatar username"
                    );

                const outgoingMessage = {
                    ...populatedMessage.toObject(),

                    clientTempId,
                };

                const conversation =
                    await Conversation
                        .findById(
                            conversationId
                        )
                        .populate(
                            "participants",
                            "fullName avatar username"
                        );

                // sender ACK
                socket.emit(
                    "message_sent",
                    outgoingMessage
                );

                // others in room
                socket.to(
                    conversationId
                ).emit(
                    "new_message",
                    {
                        message:
                            outgoingMessage,

                        conversation,
                    }
                );

            } catch (err) {

                console.log(
                    "❌ send_message error:",
                    err.message
                );

                socket.emit(
                    "message_failed",
                    {
                        clientTempId:
                            payload?.clientTempId,
                    }
                );
            }
        }
    );


    // ---------------------------------------------------
    // MARK READ
    // ---------------------------------------------------

    socket.on(
        "mark_read",
        async ({
            conversationId,
            lastReadAt,
        }) => {

            try {

                if (
                    !conversationId
                ) {
                    return;
                }

                // validate membership
                await getConversationByIdService(
                    userId,
                    conversationId
                );

                const readAt =
                    lastReadAt
                        ? new Date(
                            lastReadAt
                        )
                        : new Date();

                // update unread messages
                await Message.updateMany(
                    {
                        conversationId,

                        senderId: {
                            $ne: userId,
                        },

                        status: {
                            $ne: "read",
                        },

                        createdAt: {
                            $lte: readAt,
                        },
                    },

                    {
                        $set: {
                            status:
                                "read",

                            readAt,
                        },
                    }
                );

                // notify others
                socket.to(
                    conversationId
                ).emit(
                    "messages_read",
                    {
                        conversationId,

                        readBy:
                            userId,

                        lastReadAt:
                            readAt,
                    }
                );

            } catch (err) {

                console.log(
                    "❌ mark_read error:",
                    err.message
                );
            }
        }
    );


    // ---------------------------------------------------
    // TYPING
    // ---------------------------------------------------

    socket.on(
        "typing",
        async ({
            conversationId,
        }) => {

            try {

                await getConversationByIdService(
                    userId,
                    conversationId
                );

                socket.to(
                    conversationId
                ).emit(
                    "typing",
                    {
                        userId,
                        conversationId
                    }
                );

            } catch (err) {

                console.log(
                    "❌ typing error:",
                    err.message
                );
            }
        }
    );

    socket.on(
        "stop_typing",
        async ({
            conversationId,
        }) => {

            try {

                await getConversationByIdService(
                    userId,
                    conversationId
                );

                socket.to(
                    conversationId
                ).emit(
                    "stop_typing",
                    { userId, conversationId }
                );

            } catch (err) {

                console.log(
                    "❌ stop_typing error:",
                    err.message
                );
            }
        }
    );

    // ---------------------------------------------------
    // DISCONNECT
    // ---------------------------------------------------

    socket.on(
        "disconnect",
        () => {

            const sockets =
                onlineUsers.get(
                    userId
                );

            if (sockets) {

                sockets.delete(
                    socket.id
                );

                // fully offline
                if (
                    sockets.size === 0
                ) {

                    onlineUsers.delete(
                        userId
                    );

                    socket.broadcast.emit(
                        "user_offline",
                        {
                            userId,

                            lastSeen:
                                new Date(),
                        }
                    );
                }
            }

            console.log(
                "🔴 User offline:",
                userId
            );
        }
    );
};
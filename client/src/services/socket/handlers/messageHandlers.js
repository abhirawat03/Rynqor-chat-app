// import {
//     updateConversationLastMessage,
// } from "../helpers/conversationHelpers.js";

import {
    updateConversationCache,
} from "../helpers/updateConversationCache.js";
import { updateMessagesCache } from "../helpers/updateMessagesCache.js";

export const createMessageHandlers = ({
    queryClient,
    currentUserIdRef,
}) => {

    // ---------------------------------------------------
    // NEW MESSAGE
    // ---------------------------------------------------

    const onNewMessage = ({
        message: msg,
        conversation,
    }) => {
        console.log(
        "NEW_MESSAGE FULL",
        JSON.stringify(msg, null, 2)
    );

        updateMessagesCache({
    queryClient,
    conversationId:
        msg.conversationId,

    updater: (messages) => {

        const exists =
            messages.some(
                (m) =>
                    m._id === msg._id ||

                    (
                        m.clientTempId &&
                        msg.clientTempId &&
                        m.clientTempId ===
                        msg.clientTempId
                    )
            );

        if (exists) {
            return messages;
        }

        return [
            ...messages,
            msg,
        ];
    },
});
        
        updateConversationCache({
    queryClient,
    conversationId:
        conversation?._id ||
        msg.conversationId,
    msg,
});

        if (
            import.meta.env.MODE !==
            "production"
        ) {

            console.log(
                "NEW MESSAGE EVENT"
            );

            console.log(
    "NEW_MESSAGE",
    msg._id,
    msg.clientTempId
);
        }
    };

    // ---------------------------------------------------
    // MESSAGE SENT
    // ---------------------------------------------------

    const onMessageSent = (msg) => {
console.log(
        "MESSAGE_SENT FULL",
        JSON.stringify(msg, null, 2)
    );
        
        updateMessagesCache({
    queryClient,
    conversationId:
        msg.conversationId,

    updater: (messages) => {

        const hasOptimistic =
            messages.some(
                (m) =>
                    m.clientTempId ===
                    msg.clientTempId
            );

        if (hasOptimistic) {

            return messages.map(
                (m) =>

                    m.clientTempId ===
                    msg.clientTempId

                        ? {
                            ...msg,
                            syncState:
                                undefined,
                        }

                        : m
            );
        }

        const exists =
            messages.some(
                (m) =>
                    m._id === msg._id
            );

        if (exists) {
            return messages;
        }

        return [
            ...messages,
            msg,
        ];
    },
});

        updateConversationCache({
            queryClient,
            conversationId:
                msg.conversationId,
            msg,
        });

        if (
            import.meta.env.MODE !==
            "production"
        ) {
console.log(
    "MESSAGE SENT",
    msg._id,
    msg.clientTempId
);
            console.log(
                "MESSAGE SENT EVENT"
            );
            console.log({
            serverId: msg._id,
            clientTempId: msg.clientTempId,
        });
        }
    };


    // ---------------------------------------------------
    // MESSAGE FAILED
    // ---------------------------------------------------

    const onMessageFailed = ({
        conversationId,
        clientTempId,
    }) => {

        updateMessagesCache({
    queryClient,
    conversationId,

    updater: (messages) =>
        messages.map((msg) =>

            msg.clientTempId ===
            clientTempId

                ? {
                    ...msg,
                    syncState: "failed",
                }

                : msg
        ),
});

        if (
            import.meta.env.MODE !==
            "production"
        ) {

            console.log(
                "MESSAGE FAILED EVENT"
            );
        }
    };

    // ---------------------------------------------------
    // READ RECEIPTS
    // ---------------------------------------------------

    const onMessagesRead = ({
        conversationId,
        readBy,
        lastReadAt,
    }) => {

        if (
            String(readBy) ===
            String(
                currentUserIdRef.current
            )
        ) {
            return;
        }

        const lastReadTime =
            new Date(
                lastReadAt
            ).getTime();

        updateMessagesCache({
    queryClient,
    conversationId,

    updater: (messages) =>

        messages.map((msg) => {

            const senderId =
                msg.senderId?._id ||
                msg.senderId;

            const isMyMessage =
                String(senderId) ===
                String(
                    currentUserIdRef.current
                );

            const isRead =
                msg.createdAt &&
                new Date(
                    msg.createdAt
                ).getTime() <=
                lastReadTime;

            if (
                isMyMessage &&
                isRead &&
                msg.status !== "read"
            ) {

                return {
                    ...msg,
                    status: "read",
                    readAt: lastReadAt,
                };
            }

            return msg;
        }),
});

        if (
            import.meta.env.MODE !==
            "production"
        ) {

            console.log(
                "READ RECEIPT EVENT"
            );
        }
    };

    return {

        onNewMessage,

        onMessageSent,

        onMessageFailed,

        onMessagesRead,
    };
};
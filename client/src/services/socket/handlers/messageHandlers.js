import {
    updateConversationLastMessage,
} from "../helpers/conversationHelpers.js";

export const createMessageHandlers = ({
    setMessages,
    setConversations,
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


        setMessages((prev) => {

            const list =
                prev[msg.conversationId] || [];

            const exists = list.some(
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
                return prev;
            }

            return {

                ...prev,

                [msg.conversationId]: [
                    ...list,
                    msg,
                ],
            };
        });

        updateConversationLastMessage({
            setConversations,
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
        setMessages((prev) => {

            const list =
                prev[msg.conversationId] || [];

            const hasOptimisticMessage =
                list.some(
                    (m) =>
                        m.clientTempId &&
                        m.clientTempId ===
                        msg.clientTempId
                );

            const updated =
                hasOptimisticMessage

                    ? list.map((m) =>

                        m.clientTempId ===
                            msg.clientTempId

                            ? {
                                ...msg,

                                syncState:
                                    undefined,
                            }

                            : m
                    )

                    : (() => {

                        const exists =
                            list.some(
                                (m) =>
                                    m._id ===
                                    msg._id
                            );

                        if (exists) {
                            return list;
                        }

                        return [
                            ...list,
                            msg,
                        ];

                    })();

            return {

                ...prev,

                [msg.conversationId]:
                    updated,
            };
        });

        updateConversationLastMessage({
            setConversations,
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

        setMessages((prev) => {

            const list =
                prev[conversationId] || [];

            return {

                ...prev,

                [conversationId]:
                    list.map((msg) =>

                        msg.clientTempId ===
                            clientTempId

                            ? {
                                ...msg,

                                syncState:
                                    "failed",
                            }

                            : msg
                    ),
            };
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

        setMessages((prev) => {

            const list =
                prev[conversationId] || [];

            let changed = false;

            const updated =
                list.map((msg) => {

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
                        msg.status !==
                        "read"
                    ) {

                        changed = true;

                        return {

                            ...msg,

                            status:
                                "read",

                            readAt:
                                lastReadAt,
                        };
                    }

                    return msg;
                });

            if (!changed) {
                return prev;
            }

            return {

                ...prev,

                [conversationId]:
                    updated,
            };
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
import {
  sortConversations,
  updateConversationLastMessage,
} from "../helpers/conversationHelpers.js";
export const createMessageHandlers =
({
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

            setMessages((prev) => {

                const list =
                    prev[msg.conversationId] || [];

                const exists = list.some(
                    (m) => m._id === msg._id
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

            setConversations((prev) => {

                const exists = prev.some(
                    (conv) =>
                        conv._id.toString() ===
                        conversation._id.toString()
                );

                let updated;

                if (exists) {

                    updated = prev.map(
                        (conv) =>

                            conv._id.toString() ===
                                conversation._id.toString()

                                ? {
                                    ...conv,

                                    lastMessage:
                                        msg,

                                    updatedAt:
                                        msg.createdAt,
                                }

                                : conv
                    );

                } else {

                    updated = [
                        {
                            ...conversation,

                            lastMessage: msg,

                            updatedAt:
                                msg.createdAt,
                        },

                        ...prev,
                    ];
                }

                return sortConversations(
                    updated
                );
            });
        };

        // ---------------------------------------------------
        // MESSAGE SENT
        // ---------------------------------------------------

        const onMessageSent = (msg) => {

            setMessages((prev) => {

                const list =
                    prev[msg.conversationId] || [];

                const hasOptimisticMessage = list.some(
  (m) =>
    m.clientTempId ===
    msg.clientTempId
);

                const updated = hasOptimisticMessage

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

                    : [
                        ...list,
                        msg,
                    ];

                return {
                    ...prev,

                    [msg.conversationId]:
                        updated,
                };
            });

            updateConversationLastMessage({
    setConversations,
    conversationId: msg.conversationId,
    msg,
});
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
                readBy ===
                currentUserIdRef.current
            ) {
                return;
            }

            setMessages((prev) => {

                const list =
                    prev[conversationId] || [];

                return {
                    ...prev,

                    [conversationId]:
                        list.map((msg) => {

                            const senderId =
                                msg.senderId?._id ||
                                msg.senderId;

                            // only MY messages
                            if (
                                senderId ===
                                currentUserIdRef.current &&

                                new Date(
                                    msg.createdAt
                                ) <=
                                new Date(
                                    lastReadAt
                                )
                            ) {

                                return {
                                    ...msg,

                                    status:
                                        "read",

                                    readAt:
                                        lastReadAt,
                                };
                            }

                            return msg;
                        }),
                };
            });
        };
         return {
    onNewMessage,
    onMessageSent,
    onMessageFailed,
    onMessagesRead,
  };
    }
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
    createSocket,
    connectSocket,
    disconnectSocket,
} from "./socket";

import { SocketProviderContext } from "./SocketContext.jsx";
import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";

const SocketProvider = ({ children }) => {

    const { data: user } = useCurrentUserQuery();

    const currentUserId = user?._id;

    const currentUserIdRef = useRef(null);

    const socketRef = useRef(null);

    const [messages, setMessages] = useState({});
    const [conversations, setConversations] = useState([]);

    const [typingUsers, setTypingUsers] =
        useState({});

    const [presence, setPresence] =
        useState({});

    const typingTimeouts = useRef({});

    // ---------------------------------------------------
    // HELPERS
    // ---------------------------------------------------
    const emitTyping = (
        conversationId
    ) => {

        const socket =
            socketRef.current;

        if (!socket?.connected) {
            return;
        }

        socket.emit(
            "typing",
            {
                conversationId,
            }
        );
    };

    const emitStopTyping = (
        conversationId
    ) => {

        const socket =
            socketRef.current;

        if (!socket?.connected) {
            return;
        }

        socket.emit(
            "stop_typing",
            {
                conversationId,
            }
        );
    };
    const sortConversations = (list) => {

        return [...list].sort(
            (a, b) =>
                new Date(b.updatedAt) -
                new Date(a.updatedAt)
        );
    };

    const updateConversationLastMessage = (
        conversationId,
        msg
    ) => {

        setConversations((prev) => {

            let exists = false;

            const updated = prev.map(
                (conv) => {

                    if (
                        conv._id.toString() ===
                        conversationId.toString()
                    ) {

                        exists = true;

                        return {
                            ...conv,

                            lastMessage: msg,

                            updatedAt:
                                msg.createdAt,
                        };
                    }

                    return conv;
                }
            );

            if (!exists) {

                updated.unshift({
                    _id: conversationId,

                    lastMessage: msg,

                    updatedAt:
                        msg.createdAt,
                });
            }

            return sortConversations(
                updated
            );
        });
    };

    // ---------------------------------------------------
    // SOCKET SETUP
    // ---------------------------------------------------

    useEffect(() => {

        if (!currentUserId) {
            return;
        }

        currentUserIdRef.current =
            currentUserId;

        const socket = createSocket();

        socketRef.current = socket;

        connectSocket();

        // ---------------------------------------------------
        // CONNECT
        // ---------------------------------------------------

        const onConnect = () => {
            if (import.meta.env.MODE !== "production") console.log("✅ connected:", socket.id);
        };

        const onDisconnect = () => {
            toast.error("Disconnected from server");
            if (import.meta.env.MODE !== "production") console.log("❌ disconnected");
        };

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

                const exists = list.some(
                    (m) =>
                        m.clientTempId ===
                        msg.clientTempId
                );

                const updated = exists

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

            updateConversationLastMessage(
                msg.conversationId,
                msg
            );
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

        // ---------------------------------------------------
        // TYPING
        // ---------------------------------------------------

        const onTyping = ({
            userId,
            conversationId,
        }) => {

            setTypingUsers((prev) => {

                const next = { ...prev };

                if (!next[conversationId]) {
                    next[conversationId] = new Set();
                }

                next[conversationId].add(userId);

                return next;
            });

            if (
                typingTimeouts.current[
                userId
                ]
            ) {

                clearTimeout(
                    typingTimeouts.current[
                    userId
                    ]
                );
            }

            typingTimeouts.current[
                userId
            ] = setTimeout(() => {

                setTypingUsers((prev) => {

                    const next = {
                        ...prev,
                    };

                    next[
                        conversationId
                    ]?.delete(userId);

                    return next;
                });

            }, 3000);
        };

        const onStopTyping = ({
            userId,
            conversationId,
        }) => {

            setTypingUsers((prev) => {

                const next = { ...prev };

                next[conversationId]?.delete(userId);

                return next;
            });

            if (
                typingTimeouts.current[
                userId
                ]
            ) {

                clearTimeout(
                    typingTimeouts.current[
                    userId
                    ]
                );
            }
        };

        // ---------------------------------------------------
        // PRESENCE
        // ---------------------------------------------------

        const onOnlineUsers = (
            userIds
        ) => {

            const updated = {};

            userIds.forEach((id) => {

                updated[id] = {
                    online: true,
                };
            });

            setPresence(updated);
        };

        const onUserOnline = ({
            userId,
        }) => {

            setPresence((prev) => ({
                ...prev,

                [userId]: {
                    online: true,
                },
            }));
        };

        const onUserOffline = ({
            userId,
            lastSeen,
        }) => {

            setPresence((prev) => ({
                ...prev,

                [userId]: {
                    online: false,
                    lastSeen,
                },
            }));
        };

        // ---------------------------------------------------
        // REGISTER LISTENERS
        // ---------------------------------------------------

        socket.on(
            "connect",
            onConnect
        );

        socket.on(
            "disconnect",
            onDisconnect
        );

        socket.on(
            "new_message",
            onNewMessage
        );

        socket.on(
            "message_sent",
            onMessageSent
        );

        socket.on(
            "message_failed",
            onMessageFailed
        );

        socket.on(
            "messages_read",
            onMessagesRead
        );

        socket.on(
            "typing",
            onTyping
        );

        socket.on(
            "stop_typing",
            onStopTyping
        );

        socket.on(
            "online_users",
            onOnlineUsers
        );

        socket.on(
            "user_online",
            onUserOnline
        );

        socket.on(
            "user_offline",
            onUserOffline
        );

        // ---------------------------------------------------
        // CLEANUP
        // ---------------------------------------------------

        return () => {

            socket.off(
                "connect",
                onConnect
            );

            socket.off(
                "disconnect",
                onDisconnect
            );

            socket.off(
                "new_message",
                onNewMessage
            );

            socket.off(
                "message_sent",
                onMessageSent
            );

            socket.off(
                "message_failed",
                onMessageFailed
            );

            socket.off(
                "messages_read",
                onMessagesRead
            );

            socket.off(
                "typing",
                onTyping
            );

            socket.off(
                "stop_typing",
                onStopTyping
            );

            socket.off(
                "online_users",
                onOnlineUsers
            );

            socket.off(
                "user_online",
                onUserOnline
            );

            socket.off(
                "user_offline",
                onUserOffline
            );

            disconnectSocket();
        };

    }, [currentUserId]);

    // ---------------------------------------------------
    // OPTIMISTIC MESSAGE
    // ---------------------------------------------------

    const addLocalMessage = (
        conversationId,
        msg
    ) => {

        setMessages((prev) => ({

            ...prev,

            [conversationId]: [
                ...(prev[
                    conversationId
                ] || []),

                msg,
            ],
        }));

        updateConversationLastMessage(
            conversationId,
            msg
        );
    };

    const replaceMessageMedia = (
        conversationId,
        messageId,
        media
    ) => {

        setMessages((prev) => {

            const list =
                prev[conversationId] || [];

            return {

                ...prev,

                [conversationId]:
                    list.map((msg) => {

                        if (
                            msg._id !== messageId
                        ) {

                            return msg;

                        }

                        return {

                            ...msg,

                            media:
                                media.map(
                                    (item) => ({

                                        ...item,

                                        uploading: false,

                                    })
                                ),

                        };

                    }),

            };

        });

    };
    // ---------------------------------------------------
    // HYDRATE MESSAGES
    // ---------------------------------------------------

    const setConversationMessages = (
        conversationId,
        incomingMessages
    ) => {

        setMessages((prev) => {

            const existing =
                prev[conversationId] || [];

            const merged = [
                ...incomingMessages,
                ...existing,
            ];

            const unique =
                merged.filter(
                    (
                        msg,
                        index,
                        self
                    ) =>

                        index ===
                        self.findIndex(
                            (m) =>

                                m._id ===
                                msg._id ||

                                (
                                    m.clientTempId &&
                                    m.clientTempId ===
                                    msg.clientTempId
                                )
                        )
                );

            unique.sort(
                (a, b) =>
                    new Date(
                        a.createdAt
                    ) -
                    new Date(
                        b.createdAt
                    )
            );

            return {
                ...prev,

                [conversationId]:
                    unique,
            };
        });
    };

    // ---------------------------------------------------
    // PROVIDER
    // ---------------------------------------------------

    return (
        <SocketProviderContext
            value={{

                getSocket: () =>
                    socketRef.current,

                messages,
                conversations,

                typingUsers,
                presence,
                emitTyping,
                emitStopTyping,

                addLocalMessage,
                replaceMessageMedia,

                setConversationMessages,

                setInitialConversations:
                    setConversations,
            }}
        >
            {children}
        </SocketProviderContext>
    );
};

export default SocketProvider;
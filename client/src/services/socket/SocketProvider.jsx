import {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo,
} from "react";

import toast from "react-hot-toast";

import {
    createSocket,
    connectSocket,
    disconnectSocket,
} from "./socket";

import {
    SocketProviderContext,
} from "./SocketContext.jsx";

import {
    useCurrentUserQuery,
} from "../../hooks/auth/useCurrentUserQuery.js";

import {
    updateConversationLastMessage,
} from "./helpers/conversationHelpers";

import {
    createMessageHandlers,
} from "./handlers/messageHandlers";

import {
    createTypingHandlers,
} from "./handlers/typingHandlers";

import {
    createPresenceHandlers,
} from "./handlers/presenceHandlers";

const SocketProvider = ({
    children,
}) => {

    const {
        data: user,
    } = useCurrentUserQuery();

    const currentUserId =
        user?._id;

    const socketRef =
        useRef(null);

    const typingTimeouts =
        useRef({});

    const currentUserIdRef =
        useRef(null);

    const [messages, setMessages] =
        useState({});

    const [
        conversations,
        setConversations,
    ] = useState([]);

useEffect(() => {
    console.log(
        "CONVERSATIONS STATE",
        conversations.map(c => ({
            id: c._id,
            text: c.lastMessage?.text,
        }))
    );
}, [conversations]);
    const [
        typingUsers,
        setTypingUsers,
    ] = useState({});

    const [
        presence,
        setPresence,
    ] = useState({});

    // ---------------------------------------------------
    // SOCKET HELPERS
    // ---------------------------------------------------

    const emitTyping =
        useCallback(
            (
                conversationId
            ) => {

                const socket =
                    socketRef.current;

                if (
                    !socket?.connected
                ) {
                    return;
                }

                socket.emit(
                    "typing",
                    {
                        conversationId,
                    }
                );
            },
            []
        );

    const emitStopTyping =
        useCallback(
            (
                conversationId
            ) => {

                const socket =
                    socketRef.current;

                if (
                    !socket?.connected
                ) {
                    return;
                }

                socket.emit(
                    "stop_typing",
                    {
                        conversationId,
                    }
                );
            },
            []
        );

    // ---------------------------------------------------
    // SOCKET SETUP
    // ---------------------------------------------------
useEffect(() => {
    console.log(
        "SOCKET PROVIDER MOUNTED"
    );

    return () => {
        console.log(
            "SOCKET PROVIDER UNMOUNTED"
        );
    };
}, []);

    useEffect(() => {

        if (
            !currentUserId
        ) {
            return;
        }

        currentUserIdRef.current =
            currentUserId;

        const {
            onNewMessage,
            onMessageSent,
            onMessageFailed,
            onMessagesRead,
        } =
            createMessageHandlers({
                setMessages,
                setConversations,
                currentUserIdRef,
            });

        const {
            onTyping,
            onStopTyping,
        } =
            createTypingHandlers({
                setTypingUsers,
                typingTimeouts,
            });

        const {
            onOnlineUsers,
            onUserOnline,
            onUserOffline,
        } =
            createPresenceHandlers({
                setPresence,
            });

        const socket =
            createSocket();

        socketRef.current =
            socket;

        connectSocket();

        const onConnect =
            () => {

                toast.dismiss(
                    "socket-disconnected"
                );

                if (
                    import.meta.env
                        .MODE !==
                    "production"
                ) {

                    console.log(
                        "✅ connected",
                        socket.id
                    );
                }

                socket.emit(
                    "sync_state"
                );
            };

        const onDisconnect =
            () => {

                toast.error(
                    "Disconnected from server",
                    {
                        id: "socket-disconnected",
                    }
                );

                if (
                    import.meta.env
                        .MODE !==
                    "production"
                ) {

                    console.log(
                        "❌ disconnected"
                    );
                }
            };

        const onConnectError =
            (
                error
            ) => {

                console.error(
                    "Socket error:",
                    error.message
                );
            };

        const onVisibilityChange =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    socket.emit(
                        "sync_state"
                    );
                }
            };

        document.addEventListener(
            "visibilitychange",
            onVisibilityChange
        );

        socket.on(
            "connect",
            onConnect
        );

        socket.on(
            "disconnect",
            onDisconnect
        );

        socket.on(
            "connect_error",
            onConnectError
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

        return () => {

            document.removeEventListener(
                "visibilitychange",
                onVisibilityChange
            );

            Object.values(
                typingTimeouts.current
            ).forEach(
                clearTimeout
            );

            typingTimeouts.current =
                {};

            socket.off(
                "connect",
                onConnect
            );

            socket.off(
                "disconnect",
                onDisconnect
            );

            socket.off(
                "connect_error",
                onConnectError
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

    }, [
        currentUserId,
    ]);

    // ---------------------------------------------------
    // OPTIMISTIC MESSAGE
    // ---------------------------------------------------

    const addLocalMessage =
        useCallback(
            (
                conversationId,
                msg
            ) => {

                setMessages(
                    (
                        prev
                    ) => ({

                        ...prev,

                        [conversationId]:
                            [
                                ...(prev[
                                    conversationId
                                ] ||
                                    []),

                                msg,
                            ],
                    })
                );

                updateConversationLastMessage(
                    {
                        setConversations,
                        conversationId,
                        msg,
                    }
                );

                console.log(
    "LOCAL MESSAGE",
    msg._id,
    msg.clientTempId
);
            },
            []
            
        );

    const replaceMessageMedia =
        useCallback(
            (
                conversationId,
                messageId,
                media
            ) => {

                setMessages(
                    (
                        prev
                    ) => {

                        const list =
                            prev[
                                conversationId
                            ] ||
                            [];

                        return {

                            ...prev,

                            [conversationId]:
                                list.map(
                                    (
                                        msg
                                    ) => {

                                        if (
                                            msg._id !==
                                            messageId
                                        ) {

                                            return msg;
                                        }

                                        return {

                                            ...msg,

                                            media:
                                                media.map(
                                                    (
                                                        item
                                                    ) => ({
                                                        ...item,

                                                        uploading:
                                                            false,
                                                    })
                                                ),
                                        };
                                    }
                                ),
                        };
                    }
                );
            },
            []
        );

    // ---------------------------------------------------
    // HYDRATE MESSAGES
    // ---------------------------------------------------

    const setConversationMessages =
        useCallback(
            (
                conversationId,
                incomingMessages
            ) => {

                setMessages(
                    (
                        prev
                    ) => {

                        const existing =
                            prev[
                                conversationId
                            ] ||
                            [];

                        const merged =
                            [
                                ...incomingMessages,
                                ...existing,
                            ];

                        const map =
                            new Map();

                        merged.forEach(
                            (
                                msg
                            ) => {

                                const key =
                                    msg.clientTempId ||
                                    msg._id;

                                if (
                                    !map.has(
                                        key
                                    )
                                ) {

                                    map.set(
                                        key,
                                        msg
                                    );
                                }
                            }
                        );

                        const unique =
                            Array.from(
                                map.values()
                            );

                        unique.sort(
                            (
                                a,
                                b
                            ) => {

                                const aTime =
                                    new Date(
                                        a.createdAt ||
                                            0
                                    ).getTime();

                                const bTime =
                                    new Date(
                                        b.createdAt ||
                                            0
                                    ).getTime();

                                return (
                                    aTime -
                                    bTime
                                );
                            }
                        );

                        return {

                            ...prev,

                            [conversationId]:
                                unique,
                        };
                    }
                );
            },
            []
        );

    // ---------------------------------------------------
    // CONTEXT VALUE
    // ---------------------------------------------------
        const setInitialConversations = useCallback(
    (incoming) => {

        setConversations(prev => {

            if (prev.length > 0) {
                return prev;
            }

            return incoming;
        });

    },
    []
);
    const value =
        useMemo(
            () => ({
                getSocket:
                    () =>
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

                setInitialConversations,
            }),
            [
                messages,
                conversations,
                typingUsers,
                presence,

                emitTyping,
                emitStopTyping,

                addLocalMessage,
                replaceMessageMedia,

                setConversationMessages,
            ]
        );

    return (
        <SocketProviderContext
            value={value}
        >
            {children}
        </SocketProviderContext>
    );
};

export default SocketProvider;
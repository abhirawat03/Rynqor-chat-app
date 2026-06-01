import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
    createSocket,
    connectSocket,
    disconnectSocket,
} from "./socket";

import { SocketProviderContext } from "./SocketContext.jsx";
import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";
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

const SocketProvider = ({ children }) => {

    const socketRef = useRef(null);

    const [messages, setMessages] = useState({});
    const [conversations, setConversations] = useState([]);

    const [typingUsers, setTypingUsers] = useState({});

    const [presence, setPresence] = useState({});

    const typingTimeouts = useRef({});

    const {
        onNewMessage,
        onMessageSent,
        onMessageFailed,
        onMessagesRead,
    } = createMessageHandlers({
        setMessages,
        setConversations,
        currentUserIdRef,
    });

    const {
        onTyping,
        onStopTyping,
    } = createTypingHandlers({
        setTypingUsers,
        typingTimeouts,
    });

    const {
        onOnlineUsers,
        onUserOnline,
        onUserOffline,
    } = createPresenceHandlers({
        setPresence,
    });

    const { data: user } = useCurrentUserQuery();

    const currentUserId = user?._id;

    const currentUserIdRef = useRef(null);




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
        // TYPING
        // ---------------------------------------------------



        // ---------------------------------------------------
        // PRESENCE
        // ---------------------------------------------------



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

        updateConversationLastMessage({
            setConversations,
            conversationId,
            msg,
        });
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
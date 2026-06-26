// Manages the Socket.io lifecycle, event binding, and connection status alerts in React context.
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createSocket, connectSocket, disconnectSocket } from "./socket";
import { SocketProviderContext } from "./SocketContext.jsx";
import { useCurrentUserQuery } from "../../hooks/auth/useCurrentUserQuery.js";
import { createMessageHandlers } from "./handlers/messageHandlers";
import { createTypingHandlers } from "./handlers/typingHandlers";
import { createPresenceHandlers } from "./handlers/presenceHandlers";

const SocketProvider = ({ children }) => {
  const { data: user } = useCurrentUserQuery();
  const currentUserId = user?._id;

  const queryClient = useQueryClient();

  const socketRef = useRef(null);
  const typingTimeouts = useRef({});
  const currentUserIdRef = useRef(null);

  const [typingUsers, setTypingUsers] = useState({});
  const [presence, setPresence] = useState({});
  const [isConnected, setIsConnected] = useState(true);

  // Transmit helpers (Client -> Server)
  const emitTyping = useCallback((conversationId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit("typing", { conversationId });
  }, []);

  const emitStopTyping = useCallback((conversationId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit("stop_typing", { conversationId });
  }, []);

  // Socket setup and subscription lifecycle
  useEffect(() => {
    if (!currentUserId) return;

    currentUserIdRef.current = currentUserId;

    const { onNewMessage, onMessageSent, onMessageFailed, onMessagesRead } =
      createMessageHandlers({
        queryClient,
        currentUserIdRef,
      });

    const { onTyping, onStopTyping } = createTypingHandlers({
      setTypingUsers,
      typingTimeouts,
    });

    const { onOnlineUsers, onUserOnline, onUserOffline } =
      createPresenceHandlers({
        setPresence,
      });

    const socket = createSocket();
    socketRef.current = socket;
    connectSocket();

    const onConnect = () => {
      setIsConnected(true);
      toast.dismiss("socket-disconnected");
      socket.emit("sync_state"); // Fetch current online users
    };

    const onDisconnect = () => {
      setIsConnected(false);
      toast.error("Disconnected from server", {
        id: "socket-disconnected", // Prevent Toast notification spamming
      });
    };

    const onConnectError = (error) => {
      setIsConnected(false);
      console.error("Socket error:", error.message);
    };

    // Auto-sync presence when tab becomes active again
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        socket.emit("sync_state");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("new_message", onNewMessage);
    socket.on("message_sent", onMessageSent);
    socket.on("message_failed", onMessageFailed);
    socket.on("messages_read", onMessagesRead);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("online_users", onOnlineUsers);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);

      // Clean up typing fallback timers
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      typingTimeouts.current = {};

      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("new_message", onNewMessage);
      socket.off("message_sent", onMessageSent);
      socket.off("message_failed", onMessageFailed);
      socket.off("messages_read", onMessagesRead);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("online_users", onOnlineUsers);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);

      disconnectSocket();
    };
  }, [currentUserId, queryClient]);

  // Context value exposed to hooks and subcomponents
  const value = useMemo(
    () => ({
      getSocket: () => socketRef.current,
      isConnected,
      typingUsers,
      presence,
      emitTyping,
      emitStopTyping,
    }),
    [isConnected, typingUsers, presence, emitTyping, emitStopTyping],
  );

  return (
    <SocketProviderContext value={value}>{children}</SocketProviderContext>
  );
};

export default SocketProvider;

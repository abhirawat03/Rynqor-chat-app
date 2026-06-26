// Handles incoming real-time socket events for chat messages and manages React Query caches.
import { updateConversationCache } from "../helpers/updateConversationCache.js";
import { updateMessagesCache } from "../helpers/updateMessagesCache.js";

const notificationSound =
  typeof Audio !== "undefined" ? new Audio("/notification.mp3") : null;

export const createMessageHandlers = ({ queryClient, currentUserIdRef }) => {
  // Handles incoming messages from other participants
  const onNewMessage = ({ message: msg, conversation }) => {
    const isTabBackgrounded =
      typeof document !== "undefined" && document.hidden;
    const pathParts =
      typeof window !== "undefined" ? window.location.pathname.split("/") : [];
    const chatIndex = pathParts.indexOf("chat");
    const activeConversationId =
      chatIndex !== -1 ? pathParts[chatIndex + 1] : null;
    const isDifferentChat = activeConversationId !== msg.conversationId;

    const senderId = msg.senderId?._id || msg.senderId;
    const isMyMessage = String(senderId) === String(currentUserIdRef.current);

    // Play alert sound if receiver is active elsewhere or backgrounded
    if (!isMyMessage && (isTabBackgrounded || isDifferentChat)) {
      if (notificationSound) {
        notificationSound.play().catch(() => {});
      }
    }

    updateMessagesCache({
      queryClient,
      conversationId: msg.conversationId,
      updater: (messages) => {
        const exists = messages.some(
          (m) =>
            m._id === msg._id ||
            (m.clientTempId &&
              msg.clientTempId &&
              m.clientTempId === msg.clientTempId),
        );
        if (exists) return messages;
        return [...messages, msg];
      },
    });

    updateConversationCache({
      queryClient,
      conversationId: conversation?._id || msg.conversationId,
      msg,
    });

    if (msg.messageType === "system") {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversation", msg.conversationId],
      });
    }

    if (msg.media && msg.media.length > 0) {
      // Instantly update shared media cache on UI
      queryClient.setQueryData(
        ["conversation-media", msg.conversationId],
        (oldMedia = []) => {
          const exists = oldMedia.some((m) => m._id === msg._id);
          if (exists) return oldMedia;
          return [msg, ...oldMedia];
        },
      );

      // Invalidate with a delay to ensure database changes are committed
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["conversation-media", msg.conversationId],
        });
      }, 500);
    }
  };

  // Handles confirmation from server that our message was successfully stored
  const onMessageSent = (msg) => {
    updateMessagesCache({
      queryClient,
      conversationId: msg.conversationId,
      updater: (messages) => {
        const hasOptimistic = messages.some(
          (m) => m.clientTempId === msg.clientTempId,
        );

        // Replace optimistic placeholder with real message data
        if (hasOptimistic) {
          return messages.map((m) =>
            m.clientTempId === msg.clientTempId
              ? { ...msg, syncState: undefined }
              : m,
          );
        }

        const exists = messages.some((m) => m._id === msg._id);
        if (exists) return messages;
        return [...messages, msg];
      },
    });

    updateConversationCache({
      queryClient,
      conversationId: msg.conversationId,
      msg,
    });

    if (msg.messageType === "system") {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversation", msg.conversationId],
      });
    }

    if (msg.media && msg.media.length > 0) {
      queryClient.setQueryData(
        ["conversation-media", msg.conversationId],
        (oldMedia = []) => {
          const exists = oldMedia.some((m) => m._id === msg._id);
          if (exists) return oldMedia;
          return [msg, ...oldMedia];
        },
      );

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["conversation-media", msg.conversationId],
        });
      }, 500);
    }
  };

  // Handles delivery failure events
  const onMessageFailed = ({ conversationId, clientTempId }) => {
    updateMessagesCache({
      queryClient,
      conversationId,
      updater: (messages) =>
        messages.map((msg) =>
          msg.clientTempId === clientTempId
            ? { ...msg, syncState: "failed" }
            : msg,
        ),
    });
  };

  // Handles read receipts sync across chat participants
  const onMessagesRead = ({ conversationId, readBy, lastReadAt }) => {
    if (String(readBy) === String(currentUserIdRef.current)) {
      return;
    }

    const lastReadTime = new Date(lastReadAt).getTime();

    updateMessagesCache({
      queryClient,
      conversationId,
      updater: (messages) =>
        messages.map((msg) => {
          const senderId = msg.senderId?._id || msg.senderId;
          const isMyMessage =
            String(senderId) === String(currentUserIdRef.current);
          const isRead =
            msg.createdAt && new Date(msg.createdAt).getTime() <= lastReadTime;

          if (isMyMessage && isRead && msg.status !== "read") {
            return {
              ...msg,
              status: "read",
              readAt: lastReadAt,
            };
          }

          return msg;
        }),
    });
  };

  return {
    onNewMessage,
    onMessageSent,
    onMessageFailed,
    onMessagesRead,
  };
};

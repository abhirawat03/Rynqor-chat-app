import { useEffect, useRef, useState } from "react";

export const useChatScroll = ({
  chatMessages,
  currentUserId,
  conversationId,
  messagesLoading,
}) => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const virtuosoRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const lastScrolledMessageIdRef = useRef(null);

  useEffect(() => {
    const lastMessage = chatMessages[chatMessages.length - 1];

    if (!lastMessage) return;

    if (lastMessage._id === lastMessageIdRef.current) {
      return;
    }

    lastMessageIdRef.current = lastMessage._id;

    const senderId = lastMessage.senderId?._id || lastMessage.senderId;

    const isIncoming = senderId !== currentUserId;

    if (isIncoming && !isAtBottom) {
      setUnreadCount((count) => count + 1);
    }
  }, [chatMessages, currentUserId, isAtBottom]);

  useEffect(() => {
    const lastMessage = chatMessages[chatMessages.length - 1];

    if (!lastMessage) return;

    if (lastMessage._id === lastScrolledMessageIdRef.current) {
      return;
    }

    lastScrolledMessageIdRef.current = lastMessage._id;

    const senderId = lastMessage.senderId?._id || lastMessage.senderId;

    // My message
    if (senderId === currentUserId) {
      const firstItemIndex = Math.max(0, 10000 - chatMessages.length);
      const lastIndex =
        chatMessages.length > 0 ? firstItemIndex + chatMessages.length - 1 : 0;
      requestAnimationFrame(() => {
        virtuosoRef.current?.scrollToIndex({
          index: lastIndex,
          align: "end",
          behavior: "auto",
        });
      });
    }
  }, [chatMessages, currentUserId]);

  useEffect(() => {
    if (isAtBottom) {
      setUnreadCount(0);
    }
  }, [isAtBottom]);

  useEffect(() => {
    lastMessageIdRef.current = null;
    lastScrolledMessageIdRef.current = null;
    setUnreadCount(0);
  }, [conversationId]);

  useEffect(() => {
    if (!messagesLoading && chatMessages.length > 0) {
      const firstItemIndex = Math.max(0, 10000 - chatMessages.length);
      const lastIndex = firstItemIndex + chatMessages.length - 1;
      const timer = setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: lastIndex,
          align: "end",
          behavior: "auto",
        });
      }, 50);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messagesLoading]);
  return {
    virtuosoRef,
    isAtBottom,
    setIsAtBottom,
    unreadCount,
    setUnreadCount,
  };
};

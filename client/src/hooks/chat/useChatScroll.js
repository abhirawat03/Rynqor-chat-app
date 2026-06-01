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

    useEffect(() => {
        const lastMessage =
            chatMessages[chatMessages.length - 1];

        if (!lastMessage) return;

        if (
            lastMessage._id ===
            lastMessageIdRef.current
        ) {
            return;
        }

        lastMessageIdRef.current =
            lastMessage._id;

        const senderId =
            lastMessage.senderId?._id ||
            lastMessage.senderId;

        const isIncoming =
            senderId !== currentUserId;

        if (
            isIncoming &&
            !isAtBottom
        ) {
            setUnreadCount(
                (count) => count + 1
            );
        }
    }, [
        chatMessages,
        currentUserId,
        isAtBottom,
    ]);

    useEffect(() => {
        const lastMessage =
            chatMessages[chatMessages.length - 1];

        if (!lastMessage) return;

        const senderId =
            lastMessage.senderId?._id ||
            lastMessage.senderId;

        // My message
        if (senderId === currentUserId) {
            requestAnimationFrame(() => {
                virtuosoRef.current?.scrollToIndex({
                    index: chatMessages.length - 1,
                    align: "end",
                    behavior: "smooth",
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
        setUnreadCount(0);
    }, [conversationId]);

    useEffect(() => {
        if (
            !messagesLoading &&
            chatMessages.length > 0
        ) {
            requestAnimationFrame(() => {
                virtuosoRef.current?.scrollToIndex({
                    index: chatMessages.length - 1,
                    align: "end",
                    behavior: "auto",
                });
            });
        }
    }, [
        conversationId,
        messagesLoading,
    ]);

    return {
        virtuosoRef,
        isAtBottom,
        setIsAtBottom,
        unreadCount,
        setUnreadCount,
    };
}

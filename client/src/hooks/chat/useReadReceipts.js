import { useCallback } from "react";
import { useEffect, useRef } from "react";

export const useReadReceipts = ({
    conversationId,
    chatMessages,
    currentUserId,
    containerRef,
    getSocket,
}) => {
const lastMarkedRef = useRef(null);

const emitReadReceipt = useCallback(() => {

        if (
            !conversationId
        ) {
            return;
        }

        const socket =
            getSocket();

        if (
            !socket?.connected
        ) {
            return;
        }

        if (
            document.visibilityState !==
            "visible"
        ) {
            return;
        }

        const container =
            containerRef.current;

        if (!container) {
            return;
        }

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        const isNearBottom =
            distanceFromBottom < 100;

        if (!isNearBottom) {
            return;
        }

        const unreadIncoming =
            [...chatMessages]
                .reverse()
                .find((msg) => {

                    const senderId =
                        msg.senderId?._id ||
                        msg.senderId;

                    return (
                        senderId !==
                        currentUserId &&
                        msg.status !==
                        "read"
                    );
                });

        if (
            !unreadIncoming
        ) {
            return;
        }

        const lastReadAt =
            unreadIncoming.createdAt;

        if (
            lastMarkedRef.current ===
            lastReadAt
        ) {
            return;
        }

        lastMarkedRef.current =
            lastReadAt;

        socket.emit(
            "mark_read",
            {
                conversationId,
                lastReadAt,
            }
        );
    }, [
            conversationId,
            chatMessages,
            currentUserId,
            containerRef,
            getSocket,
        ]);;

    useEffect(() => {
    
            emitReadReceipt();
    
        }, [
            emitReadReceipt,
        ]);

    useEffect(() => {

        const handleVisibility =
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    lastMarkedRef.current =
                        null;

                    emitReadReceipt();
                }
            };

        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );

        return () => {

            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );
        };

    }, [emitReadReceipt]);

    return {
        emitReadReceipt
    }

}
import {
    useEffect,
    useRef,
} from "react";
import { useMessagesQuery } from "../../hooks/messages/useMessagesQuery.js";
import { useSocket } from "../../services/socket/useSocket.js";

export const useChatMessages = ({
    conversationId,
    currentUserId,
}) => {
    const {
        getSocket,

        messages,

        addLocalMessage,

        setConversationMessages,
    } = useSocket();
const { data: messagesData, isLoading: messagesLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = useMessagesQuery(conversationId);
const hydratedRef = useRef(false);

    useEffect(() => {
        hydratedRef.current = false;
    }, [conversationId]);

    useEffect(() => {

        if (
            hydratedRef.current ||
            !conversationId ||
            !messagesData?.pages
        ) {
            return;
        }

        const allMessages =
            messagesData.pages.flatMap(
                (page) => page.messages
            );

        setConversationMessages(
            conversationId,
            allMessages
        );

        hydratedRef.current = true;

    }, [
        conversationId,
        messagesData,
        setConversationMessages,
    ]);

    const chatMessages =
        messages[
        conversationId
        ] || [];
const sendMessage = (
        text,
        media = []
    ) => {

        const trimmed =
            text.trim();

        if (
            !trimmed &&
            media.length === 0
        ) {
            return;
        }

        const socket =
            getSocket();

        // -----------------------------------
        // OFFLINE MESSAGE
        // -----------------------------------

        if (
            !socket?.connected
        ) {

            const failedMessage = {
                _id:
                    crypto.randomUUID(),

                conversationId,

                text: trimmed,

                media,

                senderId:
                    currentUserId,

                createdAt:
                    new Date().toISOString(),

                syncState:
                    "failed",
            };

            addLocalMessage(
                conversationId,
                failedMessage
            );

            return;
        }

        // -----------------------------------
        // OPTIMISTIC MESSAGE
        // -----------------------------------

        const clientTempId =
            crypto.randomUUID();

        const tempMessage = {
            _id:
                clientTempId,

            clientTempId,

            conversationId,

            text: trimmed,

            media,

            senderId:
                currentUserId,

            createdAt:
                new Date().toISOString(),

            syncState:
                "sending",
        };

        addLocalMessage(
            conversationId,
            tempMessage
        );

        return clientTempId;
    };

    return {
        chatMessages,
        sendMessage,
        messagesLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    }
}
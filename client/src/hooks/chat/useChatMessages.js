import { useMessagesQuery } from "../../hooks/messages/useMessagesQuery.js";
import { useSocket } from "../../services/socket/useSocket.js";
import {
    useQueryClient,
} from "@tanstack/react-query";
import { updateMessagesCache } from "../../services/socket/helpers/updateMessagesCache.js";

export const useChatMessages = ({
    conversationId,
    currentUserId,
}) => {
    const {
        getSocket,
    } = useSocket();

    const queryClient = useQueryClient();

    const { data: messagesData, isLoading: messagesLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = useMessagesQuery(conversationId);

    const chatMessages =
        messagesData?.pages
            ? [...messagesData.pages].reverse().flatMap((page) => page.messages)
            : [];
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

            updateMessagesCache({
    queryClient,
    conversationId,

    updater: (messages) => [
        ...messages,
        failedMessage,
    ],
});

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

        updateMessagesCache({
    queryClient,
    conversationId,

    updater: (messages) => [
        ...messages,
        tempMessage,
    ],
});

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
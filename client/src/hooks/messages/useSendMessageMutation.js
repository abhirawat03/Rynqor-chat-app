import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "../../services/messageService";

export const useSendMessageMutation = (conversationId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendMessage,

        onSuccess: (newMessage) => {
            queryClient.setQueryData(["messages", conversationId], (old = []) => {
                const exists = old.some(
                    (msg) => msg._id === newMessage._id
                );

                if (exists) return old;

                return [...old, newMessage];
            }
            );
        },
        onError: (error) => {
            console.error("Send message failed:", error);
        },
    })
}
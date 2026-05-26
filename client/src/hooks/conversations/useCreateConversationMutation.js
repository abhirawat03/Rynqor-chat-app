import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversation } from "../../services/conversationService";

export const useCreateConversationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createConversation,

        onSuccess: (newConversation) => {
            queryClient.setQueryData(["conversations"], (old = []) => {
                const filtered = old.filter((conv) => conv._id !== newConversation._id);
                return [newConversation, ...filtered];
            });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },

        onError: (error) => {
            console.error("Create conversation failed:", error);
        },
    });
};

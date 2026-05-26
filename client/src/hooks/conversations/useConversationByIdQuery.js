import { useQuery } from "@tanstack/react-query";
import { getConversationById } from "../../services/conversationService";

export const useConversationByIdQuery = (conversationId) => {
    return useQuery({
        queryKey: ["conversation", conversationId],
        queryFn: () => getConversationById(conversationId),
        enabled: !!conversationId,
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
    });
};
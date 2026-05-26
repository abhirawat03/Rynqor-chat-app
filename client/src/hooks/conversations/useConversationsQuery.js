import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../../services/conversationService";

export const useConversationsQuery = () => {
    return useQuery({
        queryKey:["conversations"],
        queryFn:getConversations,
        staleTime:1000 * 60,
        refetchOnWindowFocus: false,
    })
}
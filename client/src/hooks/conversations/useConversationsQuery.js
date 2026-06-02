import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../../services/conversationService";

export const useConversationsQuery = () => {
    return useQuery({
        queryKey:["conversations"],
        queryFn:getConversations,
        refetchOnWindowFocus: false,
    })
}
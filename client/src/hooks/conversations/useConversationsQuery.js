import { useQuery} from "@tanstack/react-query";
import { getConversations } from "../../services/conversationService";

export const useConversationsQuery = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: getConversations,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
};
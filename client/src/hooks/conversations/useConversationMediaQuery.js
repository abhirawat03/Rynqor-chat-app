import { useQuery } from "@tanstack/react-query";
import { getConversationMedia } from "../../services/conversationService.js";

const useConversationMediaQuery = (conversationId) => {
  return useQuery({
    queryKey: ["conversation-media", conversationId],

    queryFn: () => getConversationMedia(conversationId),

    enabled: !!conversationId,

    staleTime: 1000 * 60 * 5,
  });
};

export default useConversationMediaQuery;

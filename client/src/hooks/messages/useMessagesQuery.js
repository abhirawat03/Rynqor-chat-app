import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessage } from "../../services/messageService";

export const useMessagesQuery = (conversationId) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    initialPageParam: null,
    queryFn: ({ pageParam }) => getMessage(conversationId, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) {
        return undefined;
      }

      return lastPage.nextCursor;
    },

    // New messages arrive via socket — staleTime prevents redundant refetches
    // when navigating back to a conversation within the same session.
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

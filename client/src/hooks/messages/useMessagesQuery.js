import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessage } from "../../services/messageService";

export const useMessagesQuery = (conversationId) => {
    return useInfiniteQuery({
        queryKey:["messages",conversationId],
        enabled:!!conversationId,
        initialPageParam: null,
        queryFn: ({
            pageParam,
        }) => 
            getMessage(
                conversationId,
                pageParam
            ),
        getNextPageParam: (lastPage) => {
            if (!lastPage.hasMore) {
                    return undefined;
            }

                return (
                    lastPage.nextCursor
                );
        },

        staleTime:1000 * 30,
    })
}
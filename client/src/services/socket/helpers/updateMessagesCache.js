export const updateMessagesCache = ({
  queryClient,
  conversationId,
  updater,
}) => {
  queryClient.setQueryData(["messages", conversationId], (old) => {
    if (!old) {
      return {
        pages: [
          {
            messages: updater([]),
            hasMore: false,
            nextCursor: null,
          },
        ],
        pageParams: [null],
      };
    }

    return {
      ...old,

      pages: old.pages.map((page, index) => {
        if (index !== 0) {
          return page;
        }

        return {
          ...page,

          messages: updater(page.messages),
        };
      }),
    };
  });
};

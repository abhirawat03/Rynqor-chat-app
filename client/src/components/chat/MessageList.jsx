import { Virtuoso } from "react-virtuoso";
import Message from "./Message";
import DateSeparator from "./DateSeparator";

import { getDateLabel } from "../../utils/date.js";

const MessageList = ({
  conversationId,
  virtuosoRef,
  chatMessages,
  currentUserId,
  onTopReached,
  onBottomStateChange,
  isFetchingNextPage,
  isGroup
}) => {

  // React-virtuoso prepending requires allocating a virtual coordinate space so items prepended
  // at the top do not shift the current scroll position. We reserve 10,000 virtual slots at the top.
  const firstItemIndex = Math.max(0, 10000 - chatMessages.length);

  return (
    <div
      className="flex-1 min-h-0 transition-colors duration-300 bg-background"
    >
      <Virtuoso
        key={conversationId}
        ref={virtuosoRef}
        data={chatMessages}
        firstItemIndex={firstItemIndex}
        className="h-full scrollbar-hide"
        initialTopMostItemIndex={
          // Scroll immediately to the end of our reserved index range to show the latest messages first
          chatMessages.length > 0
            ? 9999
            : undefined
        }
        followOutput={(isBottom) => isBottom ? "smooth" : false}

        startReached={
          onTopReached
        }
        atBottomStateChange={
          onBottomStateChange
        }
        overscan={1200}
        itemContent={(
          index,
          msg
        ) => {
          const relativeIndex = index - firstItemIndex;
          const prevMessage =
            chatMessages[
              relativeIndex - 1
            ];

          const showDateSeparator =
            !prevMessage ||
            getDateLabel(
              prevMessage.createdAt
            ) !==
            getDateLabel(
              msg.createdAt
            );

          return (
            <>
              {showDateSeparator && (
                <DateSeparator
                  label={getDateLabel(
                    msg.createdAt
                  )}
                />
              )}

              <div
                className="w-full max-w-5xl px-3 pb-3 mx-auto"
              >
                <Message
                  message={msg}
                  isOwn={
                    (
                      msg.senderId?._id ||
                      msg.senderId
                    ) ===
                    currentUserId
                  }
                  syncState={
                    msg.syncState
                  }
                  isGroup={isGroup}
                />
              </div>
            </>
          );
        }}
        components={{
          Header: () => (
            <div className="w-full flex justify-center py-2 shrink-0">
              {isFetchingNextPage && (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          ),
          Footer: () => <div className="h-2 shrink-0" />,
        }}
      />
    </div>
  );
};

export default MessageList;
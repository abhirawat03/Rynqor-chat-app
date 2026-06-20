// import { useRef, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import DateSeparator from "./DateSeparator";

import { getDateLabel } from "../../utils/date.js";

const MessageList = ({
  conversationId,
  virtuosoRef,
  chatMessages,
  currentUserId,
  isTyping,
  onTopReached,
  onBottomStateChange,
  isFetchingNextPage
}) => {
  // const scrollerRefLocal = useRef(null);

  // useEffect(() => {
  //   if (isTyping && isAtBottom && scrollerRefLocal.current) {
  //     requestAnimationFrame(() => {
  //       const el = scrollerRefLocal.current;
  //       el.scrollTo({
  //         top: el.scrollHeight,
  //         behavior: "smooth",
  //       });
  //     });
  //   }
  // }, [isTyping, isAtBottom]);

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
          Footer: () => (
            <div className="w-full max-w-5xl px-3 py-1 mx-auto">
              {isTyping && (
                <TypingIndicator />
              )}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default MessageList;
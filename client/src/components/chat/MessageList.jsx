import { useMemo } from "react";
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
  isGroup,
}) => {
  // React-virtuoso prepending requires allocating a virtual coordinate space so items prepended
  // at the top do not shift the current scroll position. We reserve 10,000 virtual slots at the top.
  const firstItemIndex = Math.max(0, 10000 - chatMessages.length);

  const firstUnreadMessageId = useMemo(() => {
    return chatMessages.find(
      (msg) =>
        String(msg.senderId?._id || msg.senderId) !== String(currentUserId) &&
        msg.status !== "read",
    )?._id;
  }, [chatMessages, currentUserId]);

  return (
    <div className="flex-1 min-h-0 transition-colors duration-300 bg-background">
      <Virtuoso
        key={conversationId}
        ref={virtuosoRef}
        data={chatMessages}
        firstItemIndex={firstItemIndex}
        className="h-full scrollbar-hide"
        initialTopMostItemIndex={
          // Scroll immediately to the end of our reserved index range to show the latest messages first
          chatMessages.length > 0 ? 9999 : undefined
        }
        followOutput={(isBottom) => (isBottom ? "smooth" : false)}
        startReached={onTopReached}
        atBottomStateChange={onBottomStateChange}
        overscan={1200}
        itemContent={(index, msg) => {
          const relativeIndex = index - firstItemIndex;
          const prevMessage = chatMessages[relativeIndex - 1];

          const showDateSeparator =
            !prevMessage ||
            getDateLabel(prevMessage.createdAt) !== getDateLabel(msg.createdAt);

          const nextMessage = chatMessages[relativeIndex + 1];

          const isNextMessageFromSameSender =
            nextMessage &&
            String(nextMessage.senderId?._id || nextMessage.senderId) ===
              String(msg.senderId?._id || msg.senderId);

          const isNextOnSameDay =
            nextMessage &&
            getDateLabel(nextMessage.createdAt) === getDateLabel(msg.createdAt);

          const hideAvatar = isNextMessageFromSameSender && isNextOnSameDay;

          const isPrevMessageFromSameSender =
            prevMessage &&
            String(prevMessage.senderId?._id || prevMessage.senderId) ===
              String(msg.senderId?._id || msg.senderId);

          const hideName = isPrevMessageFromSameSender && !showDateSeparator;

          const showNewMessageBadge = msg._id === firstUnreadMessageId;

          return (
            <>
              {showDateSeparator && (
                <DateSeparator label={getDateLabel(msg.createdAt)} />
              )}

              {showNewMessageBadge && (
                <div className="flex items-center justify-center my-4 max-w-5xl mx-auto px-3 select-none">
                  <div className="flex-1 border-t border-accent/20 dark:border-accent/10" />
                  <span className="px-3 py-0.5 text-[10px] tracking-wider uppercase font-bold text-accent bg-accent/5 dark:bg-accent/10 rounded-full border border-accent/20 mx-4">
                    New Messages
                  </span>
                  <div className="flex-1 border-t border-accent/20 dark:border-accent/10" />
                </div>
              )}

              <div className="w-full max-w-5xl px-3 pb-3 mx-auto">
                <Message
                  message={msg}
                  isOwn={(msg.senderId?._id || msg.senderId) === currentUserId}
                  syncState={msg.syncState}
                  isGroup={isGroup}
                  hideAvatar={hideAvatar}
                  hideName={hideName}
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

import { Virtuoso } from "react-virtuoso";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import DateSeparator from "./DateSeparator";

const getDateLabel = (
  date
) => {

  const today =
    new Date();

  const yesterday =
    new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const messageDate =
    new Date(date);

  if (
    messageDate.toDateString() ===
    today.toDateString()
  ) {
    return "Today";
  }

  if (
    messageDate.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString();
};

const MessageList = ({
  conversationId,
  virtuosoRef,
  chatMessages,
  currentUserId,
  isTyping,
  onTopReached,
  onBottomStateChange,
  isAtBottom,
}) => {


  return (
    <div
      className="
        flex-1
        min-h-0

        bg-background

        transition-colors
        duration-300
      "
    >
      <Virtuoso
        key={conversationId}
        ref={virtuosoRef}
        data={chatMessages}
        className="h-full scrollbar-hide"
        initialTopMostItemIndex={
    chatMessages.length > 0
      ? chatMessages.length - 1
      : undefined
  }
        followOutput={isAtBottom ? "smooth" : false}
        startReached={
          onTopReached
        }
        atBottomStateChange={
          onBottomStateChange
        }
        overscan={300}
        itemContent={(
          index,
          msg
        ) => {

          const prevMessage =
            chatMessages[
            index - 1
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
                className="
          mx-auto
          w-full
          max-w-5xl

          px-3
          pb-1

          first:pt-3
        "
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
    Footer: () => (
      <>
        {isTyping && (
          <div className="mx-auto w-full max-w-5xl px-3 py-2">
            <TypingIndicator />
          </div>
        )}
      </>
    ),
  }}
      />
    </div>
  );
};

export default MessageList;
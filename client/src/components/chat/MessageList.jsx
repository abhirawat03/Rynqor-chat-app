import { Virtuoso } from "react-virtuoso";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

const MessageList = ({
  virtuosoRef,
  chatMessages,
  currentUserId,
  isTyping,
  onTopReached,
  onBottomStateChange,
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
        ref={virtuosoRef}
        data={chatMessages}
        className="h-full"
        followOutput={(isAtBottom) =>
          isAtBottom
            ? "smooth"
            : false
        }
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
        ) => (
          <div
            className="
              mx-auto
              w-full
              max-w-5xl

              px-3

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
        )}
        components={{
          Footer: () =>
            isTyping ? (
              <div
                className="
                  mx-auto
                  w-full
                  max-w-5xl

                  px-3
                  py-2
                "
              >
                <TypingIndicator />
              </div>
            ) : null,
        }}
      />
    </div>
  );
};

export default MessageList;
import Message from "./Message";

import TypingIndicator
  from "./TypingIndicator";

const MessageList = ({

  containerRef,

  chatMessages,

  currentUserId,

  isTyping,
}) => {

  return (
    <div
      ref={containerRef}
      className="
        scrollbar-hide

        flex-1
        min-h-0

        overflow-y-auto
        overflow-x-hidden

        px-3
        pt-3
        pb-2

        bg-background

        transition-colors
        duration-300

        md:pb-6
      "
    >

      {/* CHAT WRAPPER */}
      <div
        className="
          mx-auto

          flex
          min-h-full
          w-full
          max-w-5xl
          flex-1
          flex-col
          justify-end

          gap-2
        "
      >

        {/* MESSAGES */}
        {chatMessages.map(
          (msg) => (

            <Message
              key={msg._id}

              message={msg}

              isOwn={
                (
                  msg.senderId?._id ||
                  msg.senderId
                ) === currentUserId
              }

              syncState={
                msg.syncState
              }
            />

          )
        )}

        {/* TYPING */}
        {isTyping && (
          <TypingIndicator />
        )}

      </div>

    </div>
  );
};

export default MessageList;
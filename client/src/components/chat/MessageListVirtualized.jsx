import { Virtuoso } from "react-virtuoso";

import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

const MessageListVirtualized = ({
  chatMessages,
  currentUserId,
  isTyping,
}) => {

  return (

    <div
      className="
        flex-1
        min-h-0

        bg-background
      "
    >

      <Virtuoso
        style={{
          height: "100%",
        }}

        data={chatMessages}

        itemContent={(
          _index,
          msg
        ) => (

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

        )}

        components={{
          Footer: () =>
            isTyping
              ? <TypingIndicator />
              : null,
        }}
      />

    </div>

  );

};

export default MessageListVirtualized;
export const createTypingHandlers =
({
  setTypingUsers,
  typingTimeouts,
}) => {
const onTyping = ({
            userId,
            conversationId,
        }) => {

            setTypingUsers((prev) => ({
  ...prev,

  [conversationId]: new Set([
    ...(prev[conversationId] || []),
    userId,
  ]),
}));

            if (
                typingTimeouts.current[
                userId
                ]
            ) {

                clearTimeout(
                    typingTimeouts.current[
                    userId
                    ]
                );
            }

            typingTimeouts.current[
                userId
            ] = setTimeout(() => {

                setTypingUsers((prev) => {

                    const next = {
                        ...prev,
                    };

                    next[
                        conversationId
                    ]?.delete(userId);

                    return next;
                });

            }, 3000);
        };

        const onStopTyping = ({
            userId,
            conversationId,
        }) => {

            setTypingUsers((prev) => ({
  ...prev,

  [conversationId]: new Set([
    ...(prev[conversationId] || []),
    userId,
  ]),
}));

            if (
                typingTimeouts.current[
                userId
                ]
            ) {

                clearTimeout(
                    typingTimeouts.current[
                    userId
                    ]
                );
            }
        };
        return {
    onTyping,
    onStopTyping,
  };
};
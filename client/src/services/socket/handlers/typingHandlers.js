// Handles incoming typing status changes with a fallback timeout to auto-clear typing states.
export const createTypingHandlers = ({ setTypingUsers, typingTimeouts }) => {
  const onTyping = ({ userId, conversationId }) => {
    // Track typing status in a Set per conversation
    setTypingUsers((prev) => {
      const next = { ...prev };
      const currentSet = next[conversationId] || new Set();
      const newSet = new Set(currentSet);
      newSet.add(userId);
      next[conversationId] = newSet;
      return next;
    });

    if (typingTimeouts.current[userId]) {
      clearTimeout(typingTimeouts.current[userId]);
    }

    // Fallback: clear status in 3s if stop_typing event is lost
    typingTimeouts.current[userId] = setTimeout(() => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (next[conversationId]) {
          const newSet = new Set(next[conversationId]);
          newSet.delete(userId);
          next[conversationId] = newSet;
        }
        return next;
      });
      delete typingTimeouts.current[userId];
    }, 3000);
  };

  const onStopTyping = ({ userId, conversationId }) => {
    setTypingUsers((prev) => {
      const next = { ...prev };
      if (next[conversationId]) {
        const newSet = new Set(next[conversationId]);
        newSet.delete(userId);
        next[conversationId] = newSet;
      }
      return next;
    });

    if (typingTimeouts.current[userId]) {
      clearTimeout(typingTimeouts.current[userId]);
      delete typingTimeouts.current[userId];
    }
  };

  return {
    onTyping,
    onStopTyping,
  };
};

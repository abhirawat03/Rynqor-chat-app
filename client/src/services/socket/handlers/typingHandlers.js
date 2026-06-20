export const createTypingHandlers = ({
  setTypingUsers,
  typingTimeouts,
}) => {
  const onTyping = ({ userId, conversationId }) => {
    // Add user to typing set immutably
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

    // Set a debounce timeout to automatically stop typing indicator after 3 seconds
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
    // Remove user from typing set immutably
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
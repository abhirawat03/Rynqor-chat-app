// Handles user presence updates (online/offline/last seen) sent by the socket server.
export const createPresenceHandlers = ({ setPresence }) => {
  // Sync initial list of online users on connection
  const onOnlineUsers = (userIds) => {
    const updated = {};

    userIds.forEach((id) => {
      updated[id] = {
        online: true,
      };
    });

    setPresence(updated);
  };

  const onUserOnline = ({ userId }) => {
    setPresence((prev) => ({
      ...prev,
      [userId]: {
        online: true,
      },
    }));
  };

  const onUserOffline = ({ userId, lastSeen }) => {
    setPresence((prev) => ({
      ...prev,
      [userId]: {
        online: false,
        lastSeen,
      },
    }));
  };

  return {
    onOnlineUsers,
    onUserOnline,
    onUserOffline,
  };
};

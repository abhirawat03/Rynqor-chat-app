// Socket.io singleton manager with automatic reconnection and cookie-based authorization.
import { io } from "socket.io-client";
import toast from "react-hot-toast";

let socket;

export const createSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true, // Pass session cookies to the socket handshake
      autoConnect: false,
      reconnection: true,
    });

    socket.on("connect", () => {
      // Connect state is synchronized inside SocketProvider
    });

    socket.on("disconnect", () => {
      toast.error("Disconnected from server");
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

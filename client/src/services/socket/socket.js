// socket.js
import { io } from "socket.io-client";
import toast from "react-hot-toast";

let socket;

export const createSocket = () => {
    if (!socket) {
        socket = io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true,
            autoConnect: false,
            reconnection: true,
        });

        socket.on("connect", () => {
            if (import.meta.env.MODE !== "production") console.log("✅ Socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            toast.error("Disconnected from server");
            if (import.meta.env.MODE !== "production") console.log("❌ Socket disconnected");
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

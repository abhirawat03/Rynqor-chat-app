// socket.js
import { io } from "socket.io-client";

let socket;

export const createSocket = () => {
    if (!socket) {
        socket = io("http://localhost:8000", {
            withCredentials: true,
            autoConnect: false,
            reconnection: true,
        });

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
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

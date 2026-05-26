import { useSocketContext } from "./SocketContext";

export const useSocket = () => {
    const ctx = useSocketContext();

    if (!ctx) {
        throw new Error("Socket not initialized");
    }

    return ctx;
};
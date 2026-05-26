import { Server } from "socket.io";
import { registerHandlers } from "./handlers.js";
import { socketAuth } from "./socketAuth.js";
import { Client_URL } from "../config/config.js";

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
      "http://localhost:5173",
      Client_URL,
    ],
            credentials: true,
        },
    });

    // apply auth middleware
    io.use(socketAuth);

    io.on("connection", (socket) => {
        console.log("User connected:", {
            socketId: socket.id,
            userId: socket.user?._id
        });

        registerHandlers(io, socket);

    });

    return io;
};

export { initSocket };

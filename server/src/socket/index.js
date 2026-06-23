import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { registerHandlers } from "./handlers.js";
import { socketAuth } from "./socketAuth.js";
import { CLIENT_URL } from "../config/config.js";

const initSocket = (server, redisClient) => {
    const io = new Server(server, {
        cors: {
            origin: [
      "http://localhost:5173",
      CLIENT_URL,
    ],
            credentials: true,
        },
    });

    // Configure Redis Adapter for scaling if Redis client is available
    if (redisClient) {
        const pubClient = redisClient;
        const subClient = redisClient.duplicate();
        subClient.connect()
            .then(() => {
                io.adapter(createAdapter(pubClient, subClient));
                console.log("🔌 Socket.io Redis Adapter configured successfully.");
            })
            .catch((err) => {
                console.error("❌ Failed to initialize Socket.io Redis Adapter:", err.message);
            });
    } else {
        console.log("🔌 Socket.io running with default in-memory adapter.");
    }

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

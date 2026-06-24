import http from "http";
import connectDB from "./config/db.js";
import { initRedis } from "./config/redisClient.js";
import {app} from './app.js'
import {PORT} from "./config/config.js"
import { initSocket } from "./socket/index.js";
import "./workers/message.worker.js";

const server = http.createServer(app); // required for socket

const startServer = async () => {
    try {
        await connectDB();
        const redisClient = await initRedis();
        
        initSocket(server, redisClient);

        server.listen(PORT, () => {
            console.log(`Server is running at PORT: ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Server boot failed:", err);
        process.exit(1);
    }
};

startServer();
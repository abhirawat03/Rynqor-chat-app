import http from "http";
import connectDB from "./config/db.js";
import { initRedis } from "./config/redisClient.js";
import { app } from "./app.js";
import { PORT } from "./config/config.js";
import { initSocket } from "./socket/index.js";

const server = http.createServer(app); // required for socket

const startServer = async () => {
  try {
    await connectDB();
    const redisClient = await initRedis();

    const io = initSocket(server, redisClient);
    app.set("io", io);

    server.listen(PORT, () => {
      console.log(`Server is running at PORT: ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server boot failed:", err);
    process.exit(1);
  }
};

startServer();

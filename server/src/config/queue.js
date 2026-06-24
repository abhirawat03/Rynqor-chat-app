import { Queue } from "bullmq";
import { REDIS_URL } from "./config.js";

let connection = null;
let messageQueue = null;

if (REDIS_URL) {
  try {
    const redisUrlParsed = new URL(REDIS_URL);
    connection = {
      host: redisUrlParsed.hostname,
      port: parseInt(redisUrlParsed.port || "6379", 10),
      username: redisUrlParsed.username || undefined,
      password: redisUrlParsed.password || undefined,
      maxRetriesPerRequest: null, // Mandatory for BullMQ
    };
    messageQueue = new Queue("message-queue", { connection });
    console.log("💾 BullMQ messageQueue initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to parse REDIS_URL for BullMQ:", err.message);
  }
} else {
  console.warn("ℹ️ REDIS_URL is not set. BullMQ queues will not be initialized.");
}

export { connection, messageQueue };

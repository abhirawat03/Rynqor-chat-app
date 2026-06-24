import { Worker } from "bullmq";
import { connection } from "../config/queue.js";
import { sendMessageService } from "../services/message.service.js";

let messageWorker = null;

if (connection) {
  messageWorker = new Worker(
    "message-queue",
    async (job) => {
      console.log(`📥 [Queue Worker] Processing job ${job.id}...`);
      const { userId, payload } = job.data;
      
      try {
        const message = await sendMessageService(userId, payload);
        console.log(`✅ [Queue Worker] Saved message ${message._id} to DB.`);
        return message;
      } catch (err) {
        console.error(`❌ [Queue Worker] Error in job ${job.id}:`, err.message);
        throw err; // Rethrow to let BullMQ handle retries
      }
    },
    {
      connection,
      limiter: {
        max: 50, // Limit MongoDB writes to 50 operations per second
        duration: 1000,
      },
    }
  );

  messageWorker.on("failed", (job, err) => {
    console.error(`⚠️ [Queue Worker] Job ${job.id} failed permanently:`, err.message);
  });
} else {
  console.warn("ℹ️ BullMQ connection not available. Background worker not started.");
}

export { messageWorker };

import { createClient } from "redis";
import { REDIS_URL } from "./config.js";

let redisClient = null;

export const initRedis = async () => {
  if (!REDIS_URL) {
    console.warn("ℹ️ REDIS_URL is not set in environment. Skipping Redis initialization.");
    return null;
  }

  try {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on("error", (err) => {
      console.error("⚠️ Redis Client Error:", err.message);
    });
    await redisClient.connect();
    console.log("💾 Connected to Redis successfully.");
    return redisClient;
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err.message);
    redisClient = null;
    return null;
  }
};

export const getRedisClient = () => redisClient;

import { getRedisClient } from "../config/redisClient.js";

export const getCacheKey = (prefix, id) => `cache:${prefix}:${id}`;

export const cacheMiddleware = (prefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    const redisClient = getRedisClient();
    if (!redisClient) {
      // Redis is not active/connected; bypass caching silently
      return next();
    }

    const keyId = req.params.id || req.params.conversationId || req.params.userId || req.user?._id;
    if (!keyId) {
      return next();
    }

    const key = getCacheKey(prefix, keyId);

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        // Cache hit!
        const parsed = JSON.parse(cachedData);
        return res.status(200).json(parsed);
      }

      // Cache miss! Override res.json to capture response
      const originalJson = res.json;
      res.json = function (body) {
        res.json = originalJson; // Restore standard handler

        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient
            .setEx(key, ttlSeconds, JSON.stringify(body))
            .catch((err) => console.error("Redis setEx error:", err.message));
        }

        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      console.error("⚠️ Cache middleware error:", err.message);
      next(); // Fail-safe
    }
  };
};

export const invalidateCache = async (prefix, id) => {
  const redisClient = getRedisClient();
  if (!redisClient) return;

  const key = getCacheKey(prefix, id);
  try {
    await redisClient.del(key);
    console.log(`🧹 Cache invalidated for key: ${key}`);
  } catch (err) {
    console.error("❌ Failed to invalidate cache:", err.message);
  }
};

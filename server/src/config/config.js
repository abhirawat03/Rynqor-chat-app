// ==========================================
// 1. Helper: Validate Required Variables
// ==========================================
const getRequiredEnv = (key, defaultValue = undefined) => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    console.error(
      `❌ CONFIG ERROR: "${key}" environment variable is required.`,
    );
    process.exit(1); // Stop server immediately
  }
  return value;
};

// ==========================================
// 2. Export Configuration Variables
// ==========================================
export const PORT = parseInt(getRequiredEnv("PORT", "3000"), 10);

export const CLIENT_URL = getRequiredEnv("CLIENT_URL", "http://localhost:5173");

export const DB = {
  url: getRequiredEnv("MONGODB_URL"),
  name: getRequiredEnv("DB_NAME"),
};

export const CLOUDINARY = {
  cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
  api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
};

export const ACCESS_TOKEN = {
  secret: getRequiredEnv("ACCESS_TOKEN_SECRET"),
  expiry: getRequiredEnv("ACCESS_TOKEN_EXPIRY", "15m"),
};

export const REFRESH_TOKEN = {
  secret: getRequiredEnv("REFRESH_TOKEN_SECRET"),
  expiry: getRequiredEnv("REFRESH_TOKEN_EXPIRY", "7d"),
};

export const REDIS_URL = getRequiredEnv("REDIS_URL", "");

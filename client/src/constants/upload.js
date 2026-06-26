/**
 * File upload configurations and constraints.
 */

export const BLOCKED_EXTENSIONS = ["exe", "bat", "apk", "sh", "msi"];

export const ALLOWED_MIME_TYPES = [
  // IMAGES
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",

  // VIDEO
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // AUDIO
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",

  // DOCUMENTS
  "application/pdf",
  "text/plain",
];

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

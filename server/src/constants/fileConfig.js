/**
 * File upload validation configurations and constraints.
 */

export const ALLOWED_MIME_TYPES = [
  // IMAGES
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",

  // VIDEOS
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

export const BLOCKED_EXTENSIONS = [
  ".exe",
  ".bat",
  ".apk",
  ".sh",
  ".msi",
  ".cmd",
];

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

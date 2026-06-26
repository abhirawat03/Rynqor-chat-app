import multer from "multer";
import path from "path";
import fs from "fs";
import {
  ALLOWED_MIME_TYPES,
  BLOCKED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from "../constants/fileConfig.js";

const tempDir = "./public/temp";

// ensure directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },

  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^\w.-]/g, "_");

    const uniqueName = `${Date.now()}-${safeName}`;

    cb(null, uniqueName);
  },
});

// -------------------------------------
// FILE FILTER
// -------------------------------------

const fileFilter = (req, file, cb) => {

  // MIME VALIDATION
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }

  // EXTENSION VALIDATION
  const extension = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return cb(new Error("Dangerous files are blocked"), false);
  }

  cb(null, true);
};

// -------------------------------------
// MULTER EXPORT
// -------------------------------------

export const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

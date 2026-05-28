import multer from "multer";
import path from "path";
import fs from "fs";

const tempDir =
  "./public/temp";

// ensure directory exists
if (!fs.existsSync(tempDir)) {

  fs.mkdirSync(
    tempDir,
    { recursive: true }
  );

}

const storage =
  multer.diskStorage({

    destination: function (
      req,
      file,
      cb
    ) {

      cb(
        null,
        tempDir
      );

    },

    filename: function (
      req,
      file,
      cb
    ) {

      const safeName =
        file.originalname.replace(
          /[^\w.-]/g,
          "_"
        );

      const uniqueName =
        `${Date.now()}-${safeName}`;

      cb(
        null,
        uniqueName
      );

    },

  });

// -------------------------------------
// ALLOWED MIME TYPES
// -------------------------------------

const allowedMimeTypes = [

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

// -------------------------------------
// BLOCKED EXTENSIONS
// -------------------------------------

const blockedExtensions = [
  ".exe",
  ".bat",
  ".apk",
  ".sh",
  ".msi",
  ".cmd",
];

// -------------------------------------
// FILE FILTER
// -------------------------------------

const fileFilter =
  (
    req,
    file,
    cb
  ) => {

    console.log(
      "Uploading MIME:",
      file.mimetype
    );

    console.log(
      "Uploading file:",
      file.originalname
    );

    // MIME VALIDATION
    if (
      !allowedMimeTypes.includes(
        file.mimetype
      )
    ) {

      return cb(
        new Error(
          `Unsupported file type: ${file.mimetype}`
        ),
        false
      );

    }

    // EXTENSION VALIDATION
    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    if (
      blockedExtensions.includes(
        extension
      )
    ) {

      return cb(
        new Error(
          "Dangerous files are blocked"
        ),
        false
      );

    }

    cb(null, true);

  };

// -------------------------------------
// MULTER EXPORT
// -------------------------------------

export const upload =
  multer({

    storage,

    fileFilter,

    limits: {

      // 25MB
      fileSize:
        25 * 1024 * 1024,

    },

  });
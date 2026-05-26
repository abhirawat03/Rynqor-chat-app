import multer from "multer";

import path from "path";

const storage =
  multer.diskStorage({

    destination:
      function (
        req,
        file,
        cb
      ) {

        cb(
          null,
          "./public/temp"
        );

      },

    filename:
      function (
        req,
        file,
        cb
      ) {

        const uniqueName =
          `${Date.now()}-${
            file.originalname
          }`;

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

  // VIDEOS
  "video/mp4",
  "video/webm",

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

    // MIME TYPE VALIDATION
    if (
      !allowedMimeTypes.includes(
        file.mimetype
      )
    ) {

      return cb(
        new Error(
          "Unsupported file type"
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
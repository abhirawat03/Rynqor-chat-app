import { upload } from "./multer.middleware.js";

// -------------------------------------
// SINGLE FILE
// -------------------------------------

const handleSingleUpload = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error("Upload Error:", err);

        return res.status(400).json({
          success: false,

          message: err.message || "File upload failed",
        });
      }

      next();
    });
  };
};

// -------------------------------------
// MULTIPLE FILES
// -------------------------------------

const handleMultipleUpload = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        console.error("Upload Error:", err);

        return res.status(400).json({
          success: false,

          message: err.message || "File upload failed",
        });
      }

      next();
    });
  };
};

export { handleSingleUpload, handleMultipleUpload };

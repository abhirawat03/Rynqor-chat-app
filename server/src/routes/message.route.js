import { Router } from "express";

import {
  getMessage,
  uploadMessageMedia,
  getUploadSignature,
} from "../controllers/message.controller.js";

import { verifyJwt } from "../middleware/verifyJwt.middleware.js";

import { upload } from "../middleware/multer.middleware.js";
import { handleMultipleUpload } from "../middleware/upload.middleware.js";
import { getMessagesSchema } from "../schemas/message.schema.js";
import { validate } from "../middleware/validate.middleware.js";
import { uploadLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/upload-signature").get(getUploadSignature);

router
  .route("/upload")
  .post(uploadLimiter, handleMultipleUpload("media", 5), uploadMessageMedia);

router.route("/:conversationId").get(validate(getMessagesSchema), getMessage);

export default router;

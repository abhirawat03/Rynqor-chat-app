import { Router } from "express";

import {
  getMessage,
  getUploadSignature,
} from "../controllers/message.controller.js";

import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { getMessagesSchema } from "../schemas/message.schema.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/upload-signature").get(getUploadSignature);

router.route("/:conversationId").get(validate(getMessagesSchema), getMessage);

export default router;

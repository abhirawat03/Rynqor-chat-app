import { Router } from "express";
import {createConversation, getConversation, getConversationById, getConversationMedia} from "../controllers/conversation.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createConversationSchema, conversationIdSchema, getConversationsSchema } from "../schemas/conversation.schema.js";
const router = Router();

router.use(verifyJwt);

router.route("/")
    .post(validate(createConversationSchema),createConversation)
    .get(validate(getConversationsSchema),getConversation)

router.route("/:conversationId/media").get(validate(conversationIdSchema),getConversationMedia);

router.route("/:conversationId").get(validate(conversationIdSchema),getConversationById)


export default router
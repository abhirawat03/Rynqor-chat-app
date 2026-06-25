import { Router } from "express";
import {createConversation, getConversation, getConversationById, getConversationMedia, createGroupConversation} from "../controllers/conversation.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createConversationSchema, conversationIdSchema, getConversationsSchema, createGroupConversationSchema } from "../schemas/conversation.schema.js";
const router = Router();

router.use(verifyJwt);

router.route("/")
    .post(validate(createConversationSchema),createConversation)
    .get(validate(getConversationsSchema),getConversation)

router.route("/group")
    .post(validate(createGroupConversationSchema), createGroupConversation);

router.route("/:conversationId/media").get(validate(conversationIdSchema),getConversationMedia);

router.route("/:conversationId").get(validate(conversationIdSchema),getConversationById)


export default router
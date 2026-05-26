import { Router } from "express";
import {createConversation, getConversation, getConversationById, getConversationMedia} from "../controllers/conversation.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";

const router = Router();

router.use(verifyJwt);

router.route("/")
    .post(createConversation)
    .get(getConversation)

router.route("/:conversationId").get(getConversationById)

router.route("/:conversationId/media").get(getConversationMedia);

export default router
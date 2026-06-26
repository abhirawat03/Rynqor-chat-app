import { Router } from "express";
import {
  createConversation,
  getConversation,
  getConversationById,
  getConversationMedia,
  createGroupConversation,
  promoteToAdmin,
  removeParticipant,
  updateGroupAvatar,
  deleteGroupAvatar,
  updateGroupName,
  addParticipants,
  demoteAdmin,
  leaveGroup,
  deleteGroup,
} from "../controllers/conversation.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { handleSingleUpload } from "../middleware/upload.middleware.js";
import { uploadLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  createConversationSchema,
  conversationIdSchema,
  getConversationsSchema,
  createGroupConversationSchema,
  promoteToAdminSchema,
  removeParticipantSchema,
  updateGroupNameSchema,
  addParticipantsSchema,
  demoteAdminSchema,
} from "../schemas/conversation.schema.js";

const router = Router();

router.use(verifyJwt);

router
  .route("/")
  .post(validate(createConversationSchema), createConversation)
  .get(validate(getConversationsSchema), getConversation);

router
  .route("/group")
  .post(validate(createGroupConversationSchema), createGroupConversation);

router
  .route("/:conversationId/media")
  .get(validate(conversationIdSchema), getConversationMedia);

// Group Management Routes
router
  .route("/:conversationId/admins")
  .put(validate(promoteToAdminSchema), promoteToAdmin);

router
  .route("/:conversationId/admins/:adminId")
  .delete(validate(demoteAdminSchema), demoteAdmin);

router
  .route("/:conversationId/participants")
  .post(validate(addParticipantsSchema), addParticipants);

router
  .route("/:conversationId/participants/:participantId")
  .delete(validate(removeParticipantSchema), removeParticipant);

router
  .route("/:conversationId/name")
  .patch(validate(updateGroupNameSchema), updateGroupName);

router
  .route("/:conversationId/avatar")
  .patch(uploadLimiter, handleSingleUpload("avatar"), updateGroupAvatar)
  .delete(validate(conversationIdSchema), deleteGroupAvatar);

router
  .route("/:conversationId/leave")
  .post(validate(conversationIdSchema), leaveGroup);

router
  .route("/:conversationId")
  .get(validate(conversationIdSchema), getConversationById)
  .delete(validate(conversationIdSchema), deleteGroup);

export default router;

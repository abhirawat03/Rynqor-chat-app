import { Router } from "express";
import { changePassword, deleteAvatar, getUser, searchUsers, updateAvatar, updateProfile } from "../controllers/user.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { handleSingleUpload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { changePasswordSchema, getUserSchema, searchUsersSchema, updateProfileSchema } from "../schemas/user.schema.js";
import { uploadLimiter, authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.use(verifyJwt);
router.route("/search").get(validate(searchUsersSchema),searchUsers);
router.route("/profile").patch(validate(updateProfileSchema),updateProfile);
router.route("/avatar")
    .patch(uploadLimiter, handleSingleUpload("avatar"),updateAvatar)
    .delete(deleteAvatar);
router.route("/change-password").patch(authLimiter, validate(changePasswordSchema),changePassword);
router.route("/:id").get(validate(getUserSchema),getUser);

export default router;

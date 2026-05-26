import { Router } from "express";
import { changePassword, deleteAvatar, getUser, searchUsers, updateAvatar, updateProfile} from "../controllers/user.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
// import { validateUpdateUser, validateListUsers } from "../validations/user.validation.js";


const router = Router();
router.use(verifyJwt);
router.route("/search").get(searchUsers);
router.route("/:id").get(getUser);
router.route("/profile").patch(updateProfile);
router.route("/avatar")
    .patch(upload.single("avatar"), updateAvatar)
    .delete(deleteAvatar);
router.route("/change-password").patch(changePassword);
export default router;

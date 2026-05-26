import {Router} from "express"
import {register, login, getCurrentUser, refreshAccessToken, logout, getSessions, logoutSession} from "../controllers/auth.controller.js"
import { validateLogin, validateRegister } from "../validations/auth.validation.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";

const router = Router();

router.route("/register").post(validateRegister, register);
router.route("/login").post(validateLogin, login);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/logout").post(verifyJwt, logout);
router.route("/sessions").get(verifyJwt, getSessions);
router.route("/logout-session/:sessionId").post(verifyJwt, logoutSession);

export default router;
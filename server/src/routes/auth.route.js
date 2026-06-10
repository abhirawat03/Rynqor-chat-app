import {Router} from "express"
import {register, login, getCurrentUser, refreshAccessToken, logout, getSessions, logoutSession} from "../controllers/auth.controller.js"
import { validateLogin } from "../validations/auth.validation.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {registerSchema} from "../schemas/auth.schema.js"

const router = Router();

router.route("/register").post(validate(registerSchema), register);
router.route("/login").post(validateLogin, login);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/logout").post( verifyJwt,logout);
router.route("/sessions").get(verifyJwt, getSessions);
router.route("/logout-session/:sessionId").post(verifyJwt, logoutSession);

export default router;
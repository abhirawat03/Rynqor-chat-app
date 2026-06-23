import {Router} from "express"
import {register, login, getCurrentUser, refreshAccessToken, logout, getSessions, logoutSession, checkUsernameAvailability} from "../controllers/auth.controller.js"
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {registerSchema, loginSchema, logoutSessionSchema} from "../schemas/auth.schema.js"
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.route("/register").post(authLimiter, validate(registerSchema), register);
router.route("/login").post(authLimiter, validate(loginSchema), login);
router.route("/refresh-token").post(authLimiter, refreshAccessToken);
router.route("/check-username").get(checkUsernameAvailability);

router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/logout").post( verifyJwt,logout);
router.route("/sessions").get(verifyJwt, getSessions);
router.route("/logout-session/:sessionId").post(verifyJwt, validate(logoutSessionSchema), logoutSession);

export default router;
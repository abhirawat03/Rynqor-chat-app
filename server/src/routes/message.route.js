import { Router } from "express";
import { getMessage, uploadMessageMedia} from "../controllers/message.controller.js";
import { verifyJwt } from "../middleware/verifyJwt.middleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router();

router.use(verifyJwt)

router.route("/upload").post(upload.array("media", 5), uploadMessageMedia);

router.route("/:conversationId").get(getMessage)

export default router;
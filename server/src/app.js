import express from 'express'
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { CLIENT_URL } from "./config/config.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";


const app = express();

app.use(helmet());
app.set("trust proxy", true);

app.use(
    cors({
        origin:[
      "http://localhost:5173",
      CLIENT_URL,
    ],
        credentials:true,
    })
)

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(cookieParser());
app.use(apiLimiter);

app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import { errorHandler } from './middleware/errorHandler.middleware.js';

app.use("/api/v1/auth", authRoutes );
app.use("/api/v1/users", userRoutes );
app.use("/api/v1/conversations", conversationRoutes );
app.use("/api/v1/messages", messageRoutes );

app.use(errorHandler);

export {app}
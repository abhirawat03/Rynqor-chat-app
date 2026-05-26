import cookie from "cookie";
import { verifyAccessToken } from "../utils/verifyToken.js";
import { ApiError } from "../utils/ApiError.js";

const socketAuth = (socket, next) => {
    try {
        const raw = socket.handshake.headers.cookie || "";
        const parsed = cookie.parse(raw);

        const token = parsed.accessToken;

        if (!token) {
            console.log(" No token found in cookies");
            return next(new Error("Unauthorized"));
        }

        const decoded = verifyAccessToken(token);

        socket.user = decoded;

        console.log("✅ Auth success:", decoded._id);

        next();
    } catch (err) {
        console.log("❌ Auth error:", err.message);
        return next(new Error("Unauthorized"));
    }
};  

export { socketAuth };
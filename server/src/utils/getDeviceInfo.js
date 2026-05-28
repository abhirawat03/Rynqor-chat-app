import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

export const getDeviceInfo = (req) => {

    const parser = new UAParser(
        req.headers["user-agent"]
    );

    const result = parser.getResult();

    // Get IP properly
    let ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        req.ip ||
        "";

    // If multiple IPs exist, take first one
    if (ip.includes(",")) {
        ip = ip.split(",")[0].trim();
    }

    // Convert IPv6 localhost style
    if (ip.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "");
    }

    const geo = geoip.lookup(ip);

    return {
        device:
            `${result.browser.name || "Unknown"} on ${result.os.name || "Unknown"}`,

        userAgent:
            req.headers["user-agent"],

        ipAddress: ip,

        location: geo
            ? `${geo.city || "Unknown"}, ${geo.country}`
            : "Unknown Location",
    };
};
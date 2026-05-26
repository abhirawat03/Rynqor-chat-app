import { UAParser }
from "ua-parser-js";

import geoip
from "geoip-lite";

export const getDeviceInfo =
(req) => {

    const parser =
        new UAParser(
            req.headers[
                "user-agent"
            ]
        );

    const result =
        parser.getResult();

    const ip =
        req.ip ||
        req.headers[
            "x-forwarded-for"
        ] ||
        "";

    const geo =
        geoip.lookup(ip);

    return {

        device:
            `${result.browser.name || "Unknown"} on ${result.os.name || "Unknown"}`,

        userAgent:
            req.headers[
                "user-agent"
            ],

        ipAddress: ip,

        location:
            geo
                ? `${geo.city || "Unknown"}, ${geo.country}`
                : "Unknown Location",
    };
};
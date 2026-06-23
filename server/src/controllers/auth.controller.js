import { registerService, loginService, getCurrentUserService, logoutService, getSessionsService, logoutSessionService, refreshAccessTokenService, checkUsernameAvailabilityService, forgotPasswordService, resetPasswordService } from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { getDeviceInfo } from "../utils/getDeviceInfo.js";

const cookieOptions = {
    httpOnly: true,

    secure:
        process.env.NODE_ENV ===
        "production",

    sameSite:
        process.env.NODE_ENV ===
            "production"
            ? "None"
            : "Lax",
    path: "/"
};

const register = async (req, res) => {
    const deviceInfo = getDeviceInfo(req);

    const { user, accessToken, refreshToken, sessionId } = await registerService(req.body, deviceInfo);

    return res
        .cookie(
            "accessToken",
            accessToken,
            {
                ...cookieOptions,
                maxAge:
                    15 * 60 * 1000
            }
        )
        .cookie(
            "refreshToken",
            refreshToken,
            {
                ...cookieOptions,
                maxAge:
                    30 *
                    24 *
                    60 *
                    60 *
                    1000
            }
        )
        .cookie(
            "sessionId",
            sessionId.toString(),
            {
                ...cookieOptions,

                maxAge:
                    30 *
                    24 *
                    60 *
                    60 *
                    1000,
            }
        )
        .status(201)
        .json(
            new ApiResponse(
                201,
                user,
                "User registered successfully"
            )
        );
}

const login = async (req, res) => {
    const deviceInfo = getDeviceInfo(req);

    const { user, accessToken, refreshToken, sessionId } = await loginService(req.body, deviceInfo);

    return res
        .cookie(
            "accessToken",
            accessToken,
            {
                ...cookieOptions,

                maxAge:
                    15 * 60 * 1000,
            }
        )
        .cookie(
            "refreshToken",
            refreshToken,
            {
                ...cookieOptions,

                maxAge:
                    30 * 24 * 60 * 60 * 1000,
            }
        )
        .cookie(
            "sessionId",
            sessionId.toString(),
            {
                ...cookieOptions,

                maxAge:
                    30 *
                    24 *
                    60 *
                    60 *
                    1000,
            }
        )
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Login Successful"
            )
        )
}

const refreshAccessToken = async (
    req,
    res
) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken;

    const {
        accessToken,
        refreshToken,
        sessionId
    } =
        await refreshAccessTokenService(
            incomingRefreshToken
        );

    return res
        .cookie(
            "accessToken",
            accessToken,
            {
                ...cookieOptions,
                maxAge:
                    15 * 60 * 1000
            }
        )
        .cookie(
            "refreshToken",
            refreshToken,
            {
                ...cookieOptions,
                maxAge:
                    30 *
                    24 *
                    60 *
                    60 *
                    1000
            }
        )
        .cookie(
            "sessionId",
            sessionId.toString(),
            {

                ...cookieOptions,

                maxAge:
                    30 *
                    24 *
                    60 *
                    60 *
                    1000,

            }
        )
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Access token refreshed"
            )
        );
};

const logout = async (req, res) => {

    const refreshToken =
        req.cookies?.refreshToken;

    await logoutService(refreshToken);

    return res
        .clearCookie(
            "accessToken",
            cookieOptions
        )
        .clearCookie(
            "refreshToken",
            cookieOptions
        )
        .clearCookie(
            "sessionId",
            cookieOptions
        )
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Logout successful"
            )
        );
};


const logoutSession =
    async (
        req,
        res
    ) => {

        const {
            sessionId
        } = req.params;

        await logoutSessionService(
            req.user._id,
            sessionId
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "Session logged out"
                )
            );
    };

const getSessions = async (
    req,
    res
) => {

    const sessions =
        await getSessionsService(
            req.user._id
        );

    const currentSessionId = req.cookies?.sessionId;

    const formattedSessions =
        sessions.map(
            (session) => ({
                ...session.toObject(),

                isCurrent:
                    session._id.toString() ===
                    currentSessionId,
            })
        );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                formattedSessions,
                "Sessions fetched successfully"
            )
        );
};

const getCurrentUser = async (req, res) => {
    res.set("Cache-Control", "no-store");
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const user = await getCurrentUserService(req.user?._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Current user fetched successfully"
            )
        )
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    await forgotPasswordService(email);
    return res.status(200).json(
        new ApiResponse(200, null, "Password reset OTP sent successfully")
    );
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    await resetPasswordService(email, otp, newPassword);
    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successfully")
    );
};

const checkUsernameAvailability = async (req, res) => {
    const { username } = req.query;
    const isAvailable = await checkUsernameAvailabilityService(username);
    return res.status(200).json(
        new ApiResponse(200, { available: isAvailable }, "Username availability checked successfully")
    );
};

export { register, login, refreshAccessToken, logout, getSessions, logoutSession, getCurrentUser, checkUsernameAvailability, forgotPassword, resetPassword }
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/generateTokens.js";

import { RefreshToken } from "../models/refreshToken.model.js";

import { verifyRefreshToken }
    from "../utils/verifyToken.js";


// ==============================
// Helper
// ==============================

const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};


// ==============================
// Register
// ==============================

const registerService = async (
    {
        username,
        email,
        password,
        fullName
    },
    deviceInfo
) => {

    email = email.toLowerCase().trim();
    username = username.toLowerCase().trim();

    const existing = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if (existing) {
        throw new ApiError(
            400,
            "User already exists"
        );
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password
    });

    const accessToken =
        generateAccessToken(user._id);

    const refreshToken =
        generateRefreshToken(user._id);

    const hashedRefreshToken =
        hashToken(refreshToken);

    const session =
        await RefreshToken.create({
            user: user._id,

            token: hashedRefreshToken,

            device:
                deviceInfo.device,

            ipAddress:
                deviceInfo.ipAddress,

            location:
                deviceInfo.location,

            userAgent:
                deviceInfo.userAgent,

            expiresAt: new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            )
        });

    const sanitizedUser = {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
    };

    return {
        user: sanitizedUser,
        accessToken,
        refreshToken,
        sessionId: session._id
    };
};


// ==============================
// Login
// ==============================

const loginService = async (
    { login, password },
    deviceInfo
) => {

    login = login.toLowerCase().trim();

    const user =
        await User.findOne({
            $or: [
                { email: login },
                { username: login }
            ]
        }).select("+password");

    if (!user) {
        throw new ApiError(
            400,
            "Invalid credentials"
        );
    }

    const isMatch =
        await user.isPasswordCorrect(password);

    if (!isMatch) {
        throw new ApiError(
            400,
            "Invalid credentials"
        );
    }

    const accessToken =
        generateAccessToken(user._id);

    const refreshToken =
        generateRefreshToken(user._id);

    const hashedRefreshToken =
        hashToken(refreshToken);

    const session =
        await RefreshToken.create({
            user: user._id,

            token: hashedRefreshToken,

            device:
                deviceInfo.device,

            ipAddress:
                deviceInfo.ipAddress,

            location:
                deviceInfo.location,

            userAgent:
                deviceInfo.userAgent,

            expiresAt: new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            )
        });

    const sanitizedUser = {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
    };

    return {
        user: sanitizedUser,
        accessToken,
        refreshToken,
        sessionId: session._id
    };
};


// ==============================
// Refresh Access Token
// ==============================

const refreshAccessTokenService =
async (incomingRefreshToken) => {

    if (!incomingRefreshToken) {
        throw new ApiError(
            401,
            "Unauthorized request"
        );
    }

    // verify jwt
    const decoded =
        verifyRefreshToken(
            incomingRefreshToken
        );

    if (!decoded?._id) {
        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }

    const hashedIncomingToken =
        hashToken(incomingRefreshToken);

    // atomic delete
    const storedToken =
        await RefreshToken.findOneAndDelete({
            token: hashedIncomingToken,
            user: decoded._id
        });

    if (!storedToken) {
        throw new ApiError(
            401,
            "Refresh token expired or already used"
        );
    }

    // verify user still exists
    const user =
        await User.findById(decoded._id);

    if (!user) {
        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }

    // generate new tokens
    const accessToken =
        generateAccessToken(user._id);

    const refreshToken =
        generateRefreshToken(user._id);

    const hashedRefreshToken =
        hashToken(refreshToken);

    // create new rotated token
    await RefreshToken.create({
        user: user._id,

        token: hashedRefreshToken,

        device:
            storedToken.device,

        ipAddress:
            storedToken.ipAddress,

        location:
            storedToken.location,

        userAgent:
            storedToken.userAgent,

        lastUsedAt: new Date(),

        expiresAt: new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000
        )
    });

    return {
        accessToken,
        refreshToken
    };
};


// ==============================
// Logout
// ==============================

const logoutService = async (
    refreshToken
) => {

    if (!refreshToken) {
        return true;
    }

    const hashedRefreshToken =
        hashToken(refreshToken);

    await RefreshToken.deleteOne({
        token: hashedRefreshToken
    });

    return true;
};


// ==============================
// Logout Specific Session
// ==============================

const logoutSessionService =
async (
    userId,
    sessionId
) => {

    await RefreshToken.deleteOne({
        _id: sessionId,
        user: userId
    });

    return true;
};


// ==============================
// Get Sessions
// ==============================

const getSessionsService =
async (userId) => {

    return await RefreshToken.find({
        user: userId
    })
    .select(`
        _id
        device
        location
        lastUsedAt
        createdAt
    `)
    .sort({
        createdAt: -1
    });
};


// ==============================
// Current User
// ==============================

const getCurrentUserService =
async (userId) => {

    const user =
        await User.findById(userId)
        .select(`
            username
            fullName
            email
            avatar
            bio
        `);

    if (!user) {
        throw new ApiError(
            400,
            "Invalid credentials"
        );
    }

    return user;
};


export {
    registerService,
    loginService,
    refreshAccessTokenService,
    logoutService,
    logoutSessionService,
    getSessionsService,
    getCurrentUserService
};
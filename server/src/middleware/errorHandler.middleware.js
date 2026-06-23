import { ApiError } from "../utils/ApiError.js";
import fs from "fs/promises";

export const errorHandler = async (err, req, res, next) => {
    // Centralized File Cleanup on request failure
    if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
    }
    if (req.files) {
        if (Array.isArray(req.files)) {
            for (const file of req.files) {
                if (file.path) {
                    await fs.unlink(file.path).catch(() => {});
                }
            }
        } else if (typeof req.files === "object") {
            for (const key of Object.keys(req.files)) {
                if (Array.isArray(req.files[key])) {
                    for (const file of req.files[key]) {
                        if (file.path) {
                            await fs.unlink(file.path).catch(() => {});
                        }
                    }
                }
            }
        }
    }

    let error = err;

    // Convert non-ApiError instances if they are database errors we know how to handle
    if (!(error instanceof ApiError)) {
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map((el) => ({
                field: el.path,
                message: el.message,
            }));
            error = new ApiError(400, "Validation Error", "VALIDATION_ERROR", validationErrors);
        } else if (error.name === "CastError") {
            error = new ApiError(400, `Invalid ${error.path}: ${error.value}`, "INVALID_ID_FORMAT");
        } else if (error.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0];
            const message = field
                ? `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken.`
                : "Duplicate key error.";
            error = new ApiError(400, message, "DUPLICATE_KEY_ERROR");
        } else {
            error = new ApiError(
                error.statusCode || 500,
                error.message || "Internal Server Error",
                error.code || "INTERNAL_SERVER_ERROR"
            );
        }
    }

    console.error("🔥 ERROR:", {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        errors: error.errors,
        stack: (error.statusCode >= 500 && process.env.NODE_ENV !== "production") ? err.stack : undefined,
    });

    // In production, hide raw internal details of unexpected 500 errors
    const responseMessage =
        process.env.NODE_ENV === "production" && error.statusCode === 500
            ? "Internal Server Error"
            : error.message;

    res.status(error.statusCode).json({
        success: false,
        message: responseMessage,
        code: error.code,
        errors: error.errors,
    });
};
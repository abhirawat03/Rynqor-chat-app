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
        let statusCode = error.statusCode || 500;
        let message = error.message || "Internal Server Error";
        let code = error.code || "INTERNAL_SERVER_ERROR";
        let errors = [];

        // Handle Mongoose Validation Error
        if (error.name === "ValidationError") {
            statusCode = 400;
            message = "Validation Error";
            code = "VALIDATION_ERROR";
            errors = Object.values(error.errors).map((el) => ({
                field: el.path,
                message: el.message,
            }));
        }
        // Handle Mongoose Cast Error (e.g. invalid ObjectId)
        else if (error.name === "CastError") {
            statusCode = 400;
            message = `Invalid ${error.path}: ${error.value}`;
            code = "INVALID_ID_FORMAT";
        }
        // Handle MongoDB duplicate key error (11000)
        else if (error.code === 11000) {
            statusCode = 400;
            code = "DUPLICATE_KEY_ERROR";
            
            // Try to extract the duplicate field name
            const field = Object.keys(error.keyValue || {})[0];
            if (field) {
                const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
                message = `${capitalizedField} is already taken.`;
            } else {
                message = "Duplicate key error.";
            }
        }

        error = new ApiError(statusCode, message, code, errors);
    }

    console.error("🔥 ERROR:", {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        errors: error.errors,
        stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
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
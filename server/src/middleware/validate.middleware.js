import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => {
    return (req, res, next) => {

        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map(
                issue => ({
                    field: issue.path.join("."),
                    message: issue.message
                })
            );

            throw new ApiError(
                400,
                "Validation failed",
                "VALIDATION_ERROR",
                errors
            );
        }

        req.body = result.data;

        next();
    };
};
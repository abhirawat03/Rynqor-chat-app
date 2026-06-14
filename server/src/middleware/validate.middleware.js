import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => {
    return (req, res, next) => {

        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const errors = result.error.issues.map(
                (issue) => ({
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

        req.body = result.data.body ?? req.body;
        req.params = result.data.params ?? req.params;
        req.query = result.data.query ?? req.query;

        next();
    };
};
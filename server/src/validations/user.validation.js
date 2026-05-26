import { ApiError } from "../utils/ApiError.js";

const validateUpdateUser = (req, res, next) => {
    const { fullName, avatar } = req.body;
    if (fullName && typeof fullName !== "string")
        throw new ApiError(400, "Invalid fullName");
    if (fullName && fullName.length < 3)
        throw new ApiError(400, "fullName must be at least 3 characters");
    if (avatar && typeof avatar !== "string")
        throw new ApiError(400, "Invalid avatar URL");
    next();
};

const validateListUsers = (req, res, next) => {
    const { search } = req.query;
    if (search && typeof search !== "string")
        throw new ApiError(400, "Invalid search query");
    next();
};

export { validateUpdateUser, validateListUsers };

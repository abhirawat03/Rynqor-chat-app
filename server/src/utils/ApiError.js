class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        code = null,
        errors = []
    ){
        super(message)
        this.name = this.constructor.name
        this.statusCode = statusCode
        this.success = false
        this.code = code,
        this.errors = errors

        Error.captureStackTrace(this, this.constructor)
    }
}

export {ApiError}
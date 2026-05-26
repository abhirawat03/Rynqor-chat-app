import { ApiError } from "../utils/ApiError.js";

const validateRegister = (req, res, next) =>{
    const {username, email, password, fullName} = req.body;
    
    if(!username || !email || !password || !fullName) throw new ApiError(400, "All fields are required");

    if(username.length < 5) throw new ApiError(400, "Username must be atleast 5 characters");

    if(!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError(400, "Invalid email format");

    if(password.length < 8) throw new ApiError(400, "Password must be atleast 8 characters");

    next()
}

const validateLogin = (req, res, next) =>{
    const {login, password} = req.body;
    if(!login || !password) throw new ApiError(400, "Email and password are required");
    if(password.length < 8) throw new ApiError(400, "Password must be atleast 8 characters")
    next()
}

export {validateRegister, validateLogin}
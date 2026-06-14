import {z} from "zod";
import { paramsSchema } from "./common.schema.js";

const registerSchema = z.object({
    body: z.object({
        username: z
            .string()
            .trim()
            .toLowerCase()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must be at most 30 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username must contain only letters, numbers, and underscores"
            ),

        email: z
            .string()
            .trim()
            .email("Invalid email format")
            .transform((value) => value.toLowerCase()),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            ),

        fullName: z
            .string()
            .trim()
            .min(2, "Full name is required")
            .max(50, "Full name must be at most 50 characters"),
    }).strict(),
});

const loginSchema = z.object({
    body: z.object({
        login: z
            .string()
            .trim()
            .min(3, "Email or username is required"),

        password: z
            .string()
            .min(1, "Password is required"),
    }).strict(),
});

const logoutSessionSchema = paramsSchema("sessionId");

export {registerSchema, loginSchema, logoutSessionSchema};
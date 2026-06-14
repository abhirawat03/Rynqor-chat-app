import { z } from "zod";
import { objectIdSchema } from "./common.schema.js";

export const getUserSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }).strict(),
});

const updateProfileSchema = z.object({
    body: z.object({
        fullName: z
            .string()
            .trim()
            .min(2, "Full name must be at least 2 characters")
            .max(50, "Full name must be at most 50 characters")
            .optional(),

        username: z
            .string()
            .trim()
            .toLowerCase()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must be at most 30 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username must contain only letters, numbers, and underscores"
            )
            .optional(),
        bio: z
            .string()
            .trim()
            .max(100, "Bio must be at most 100 characters")
            .optional(),
    })
    .strict()
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            message: "At least one field is required",
        }
    ),
});

const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z
            .string()
            .min(1, "Old password is required"),

        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            ),
    })
    .strict()
    .refine(
        (data) => data.oldPassword !== data.newPassword,
        {
            path: ["newPassword"],
            message:
                "New password must be different from old password",
        }
    ),
});

const searchUsersSchema = z.object({
    query: z.object({
        search: z
            .string()
            .trim()
            .min(1, "Search query is required"),
    }).strict(),
});

export {
    getUserSchema,
    updateProfileSchema,
    changePasswordSchema,
    searchUsersSchema,
};
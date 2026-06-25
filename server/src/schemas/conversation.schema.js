import { z } from "zod";
import { objectIdSchema, paramsSchema } from "./common.schema.js";

const createConversationSchema = z.object({
    body: z.object({
        receiverId: objectIdSchema,
    }).strict(),
});

const getConversationsSchema =z.object({
        query: z.object({
            cursor: z.string().optional(),
        }).strict(),
});

const conversationIdSchema = paramsSchema("conversationId");

const createGroupConversationSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Group name is required"),
        participants: z.array(z.string()).min(1, "At least one participant is required"),
        avatar: z.object({
            url: z.string().optional().nullable(),
            publicId: z.string().optional().nullable(),
        }).optional().nullable(),
    }).strict(),
});

export {
    createConversationSchema,
    getConversationsSchema,
    conversationIdSchema,
    createGroupConversationSchema,
};
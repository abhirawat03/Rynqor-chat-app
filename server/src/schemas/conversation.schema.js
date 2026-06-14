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

export {
    createConversationSchema,
    getConversationsSchema,
    conversationIdSchema,
};
import { z } from "zod";
import { objectIdSchema } from "./common.schema.js";

export const getMessagesSchema = z.object({
    params: z.object({
        conversationId: objectIdSchema,
    }).strict(),

    query: z.object({
        cursor: objectIdSchema.optional(),
    }).strict(),
});
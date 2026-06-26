import { z } from "zod";
import { objectIdSchema, paramsSchema } from "./common.schema.js";

const createConversationSchema = z.object({
  body: z
    .object({
      receiverId: objectIdSchema,
    })
    .strict(),
});

const getConversationsSchema = z.object({
  query: z
    .object({
      cursor: z.string().optional(),
    })
    .strict(),
});

const conversationIdSchema = paramsSchema("conversationId");

const createGroupConversationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Group name is required"),
      participants: z
        .array(z.string())
        .min(2, "At least two participants are required to create a group"),
      avatar: z
        .object({
          url: z.string().optional().nullable(),
          publicId: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .strict(),
});

const promoteToAdminSchema = z.object({
  params: z
    .object({
      conversationId: objectIdSchema,
    })
    .strict(),
  body: z
    .object({
      targetUserId: objectIdSchema,
    })
    .strict(),
});

const removeParticipantSchema = z.object({
  params: z
    .object({
      conversationId: objectIdSchema,
      participantId: objectIdSchema,
    })
    .strict(),
});

const updateGroupNameSchema = z.object({
  params: z
    .object({
      conversationId: objectIdSchema,
    })
    .strict(),
  body: z
    .object({
      name: z.string().min(1, "Group name must be at least 1 character"),
    })
    .strict(),
});

const addParticipantsSchema = z.object({
  params: z
    .object({
      conversationId: objectIdSchema,
    })
    .strict(),
  body: z
    .object({
      participantIds: z
        .array(objectIdSchema)
        .min(1, "At least one participant ID is required"),
    })
    .strict(),
});

const demoteAdminSchema = z.object({
  params: z
    .object({
      conversationId: objectIdSchema,
      adminId: objectIdSchema,
    })
    .strict(),
});

export {
  createConversationSchema,
  getConversationsSchema,
  conversationIdSchema,
  createGroupConversationSchema,
  promoteToAdminSchema,
  removeParticipantSchema,
  updateGroupNameSchema,
  addParticipantsSchema,
  demoteAdminSchema,
};

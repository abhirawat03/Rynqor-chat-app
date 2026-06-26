import { z } from "zod";
import mongoose from "mongoose";

export const objectIdSchema = z
  .string()
  .refine(mongoose.Types.ObjectId.isValid, {
    message: "Invalid ObjectId",
  });

export const paramsSchema = (key) =>
  z.object({
    params: z
      .object({
        [key]: objectIdSchema,
      })
      .strict(),
  });

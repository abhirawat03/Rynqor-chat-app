import mongoose, { Schema } from "mongoose";

const convoSchema = new Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["direct", "self", "group"],
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true },
);

// Compound index: filter by participant + sort by most recent in a single index scan
convoSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", convoSchema);

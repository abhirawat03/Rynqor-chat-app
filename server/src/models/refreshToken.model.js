import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    device: {
      type: String,
      default: "Unknown Device",
    },

    location: {
      type: String,
      default: "Unknown Location",
    },

    ipAddress: {
      type: String,
      default: "Unknown IP",
    },

    userAgent: {
      type: String,
      default: "Unknown Agent",
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },

  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ user: 1 });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

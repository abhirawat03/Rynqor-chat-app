import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 25,
      select: false,
    },
    avatar: {
      type: {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpires: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOtp: {
      type: String,
      default: null,
    },
    verificationOtpExpires: {
      type: Date,
      default: null,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  // only hash if password modified
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto-delete unverified users after their OTP expires.
// partialFilterExpression ensures verified users are never touched by this TTL.
userSchema.index(
  { verificationOtpExpires: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { isVerified: false },
  },
);

export const User = mongoose.model("User", userSchema);

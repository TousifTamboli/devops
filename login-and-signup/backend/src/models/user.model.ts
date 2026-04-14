import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true, // O(log n) indexing query for fast lookups
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // Minimal 8 char handled by validation layer before insert.
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);

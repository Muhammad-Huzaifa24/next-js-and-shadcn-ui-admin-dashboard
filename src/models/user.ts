import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import type { IUser } from "../types";

/**
 * User model - mirrors BackEnd/src/models/User.js exactly
 *
 * Fields mirror src/data/users.ts:
 *   { id, name, email, role: "administrator" }
 *
 * Security notes:
 *  - passwordHash has select:false — never returned in normal queries
 *  - bcrypt cost factor 12 in pre-save hook
 *  - refreshTokenHash stored so we can invalidate on change-password / logout
 */
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name must not exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email must not exceed 254 characters"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // excluded from all queries unless explicitly requested
    },
    role: {
      type: String,
      enum: {
        values: ["administrator"],
        message: "Role must be: administrator",
      },
      default: "administrator",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Hashed refresh token — null means no active session / token invalidated
    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

// ─── Hash password before save ───────────────────────────────────────────────
// Mongoose v9: async pre hooks must NOT accept next — just return a Promise.
// Throw to signal an error; return early to skip.
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// ─── Instance methods ─────────────────────────────────────────────────────────

/** Compare a plaintext candidate against the stored hash. */
userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

/** Compare a plaintext refresh token against the stored hash. */
userSchema.methods.compareRefreshToken = async function (candidate: string) {
  if (!this.refreshTokenHash) return false;
  return bcrypt.compare(candidate, this.refreshTokenHash);
};

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);

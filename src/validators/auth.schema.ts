import { z } from "zod";

/**
 * Auth validation schemas — mirror BackEnd/src/validators/auth.validator.js
 */

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Email must be a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(3, "Password must be at least 3 characters")
    .max(100, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").min(3, "Invalid password"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

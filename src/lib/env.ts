import { z } from "zod";

/**
 * Validates all required server-side environment variables at import time.
 * If any required variable is missing or empty the process fails fast with
 * a clear, actionable error message instead of a cryptic runtime crash.
 *
 * Import this module at the top of instrumentation.ts so validation runs
 * once on server startup — not once per request.
 */

const envSchema = z.object({
  // MongoDB
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1, "JWT_ACCESS_EXPIRES_IN is required"),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1, "JWT_REFRESH_EXPIRES_IN is required"),

  // Cookie
  COOKIE_SECRET: z.string().min(32, "COOKIE_SECRET must be at least 32 characters"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // Uploads
  MAX_FILE_SIZE_MB: z
    .string()
    .min(1)
    .transform(Number)
    .pipe(z.number().positive("MAX_FILE_SIZE_MB must be a positive number")),

  // Node
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(
      `\n\n[env] Missing or invalid environment variables:\n${issues}\n\n` +
        `Copy BackEnd/.env.example to FrontEnd/.env.local and fill in all values.\n`,
    );
  }

  return result.data;
}

/**
 * Validated, typed environment object.
 *
 * Validation is skipped during `next build` (NEXT_PHASE_EXPORT / build phase)
 * because env vars are not available at build time on Vercel. Validation runs
 * on every server start and on every request in development.
 */
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const env: Env = isBuildPhase ? (process.env as unknown as Env) : validateEnv();

// src/lib/env.ts
if (!process.env.JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is not set");
if (!process.env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is not set");

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

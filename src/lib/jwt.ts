import jwt, { type SignOptions } from "jsonwebtoken";

import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "./env";

/**
 * Central JWT helpers so cookie names, options, and secrets
 * are defined in exactly one place.
 *
 * Note: @types/jsonwebtoken types expiresIn as number | StringValue (ms lib type).
 * We cast via SignOptions to avoid overload-resolution errors while keeping
 * identical runtime behaviour to the Express version (BackEnd/src/utils/jwt.js).
 */

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

// ─── Token generators ─────────────────────────────────────────────────────────

export function signAccess(payload: object): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_ACCESS_SECRET, options);
}

export function signRefresh(payload: object): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

// ─── Cookie option factories ──────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === "production";

export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: IS_PROD, // HTTPS-only in production
    sameSite: "strict" as const,
    maxAge: 15 * 60 * 1000, // 15 min in ms
    path: "/",
  };
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "/",
  };
}

/** Clear options must match set options exactly so the browser removes the cookie. */
export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict" as const,
    path: "/",
  };
}

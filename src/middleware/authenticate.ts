import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import jwt from "jsonwebtoken";

import { ACCESS_COOKIE } from "@/lib/jwt";

import { JWT_ACCESS_SECRET } from "../lib/env";

/**
 * Middleware helper for Route Handlers to verify JWT from httpOnly cookie.
 *
 * Usage in a Route Handler:
 *   const user = await authenticate(request);
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *
 * Returns the decoded user object { id, email, role } or null if token is invalid/expired.
 */
export async function authenticate(
  _request?: NextRequest,
): Promise<{ id: string; email: string; name: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { id: string; email: string; name: string; role: string };
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch (_err) {
    // Token is invalid, expired, or tampered with
    return null;
  }
}

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE } from '@/lib/jwt';

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
  request?: NextRequest,
): Promise<{ id: string; email: string; name: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch (err) {
    // Token is invalid, expired, or tampered with
    return null;
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { logoutUser } from '@/services/auth.service';
import { ACCESS_COOKIE, REFRESH_COOKIE, clearCookieOptions } from '@/lib/jwt';

export const runtime = 'nodejs';

/**
 * POST /api/v1/auth/logout
 * 
 * Clears auth cookies and invalidates refresh token in database
 */
export async function POST(request: NextRequest) {
  try {
    // Get user if authenticated (optional - logout works even if not authenticated)
    const user = await authenticate(request);

    // Call service layer to clear refresh token
    if (user?.id) {
      await logoutUser(user.id);
    }

    // Clear cookies with exact same name + path + flags used when setting them
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, '', { ...clearCookieOptions(), maxAge: 0 });
    cookieStore.set(REFRESH_COOKIE, '', { ...clearCookieOptions(), maxAge: 0 });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Logged out successfully' 
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
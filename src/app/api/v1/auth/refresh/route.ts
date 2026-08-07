import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handleRouteError } from '@/lib/handle-error';
import { refreshTokens } from '@/services/auth.service';
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions } from '@/lib/jwt';

export const runtime = 'nodejs';

/**
 * POST /api/v1/auth/refresh
 * 
 * Refreshes access token using refresh token cookie
 * Implements token rotation for security
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Refresh token missing' 
        },
        { status: 401 }
      );
    }

    // Call service layer for token rotation
    const result = await refreshTokens(refreshToken);

    // Set new cookies (token rotation)
    cookieStore.set(ACCESS_COOKIE, result.accessToken, accessCookieOptions());
    cookieStore.set(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());

    return NextResponse.json(
      { 
        success: true, 
        data: { accessToken: result.accessToken } 
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
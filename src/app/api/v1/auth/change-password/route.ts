import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { validateRequest } from '@/middleware/validate';
import { changePasswordSchema } from '@/validators/auth.schema';
import { changePassword } from '@/services/auth.service';
import { ACCESS_COOKIE, accessCookieOptions } from '@/lib/jwt';

export const runtime = 'nodejs';

/**
 * POST /api/v1/auth/change-password
 * 
 * Changes user password and issues fresh access token
 * Invalidates all existing refresh tokens
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Validate request body
    const validation = await validateRequest(request, changePasswordSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { currentPassword, newPassword } = validation.data as {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    };

    // Call service layer
    const newAccessToken = await changePassword(user.id, currentPassword, newPassword);

    // Issue fresh access token so the user stays logged in after the change
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, newAccessToken, accessCookieOptions());

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed successfully',
        data: { accessToken: newAccessToken },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
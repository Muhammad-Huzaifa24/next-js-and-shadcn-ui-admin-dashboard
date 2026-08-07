import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { ACCESS_COOKIE, accessCookieOptions, REFRESH_COOKIE, refreshCookieOptions } from "@/lib/jwt";
import { loginLimiter } from "@/middleware/rate-limit";
import { validateRequest } from "@/middleware/validate";
import { loginUser } from "@/services/auth.service";
import { loginSchema } from "@/validators/auth.schema";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/login
 *
 * Authenticates user with email/password and sets httpOnly cookies
 * Rate limited: 5 attempts per 15 minutes per IP
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!loginLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many login attempts, please try again later.",
        },
        { status: 429 },
      );
    }

    // Validate request body
    const validation = await validateRequest(request, loginSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { email, password } = validation.data as {
      email: string;
      password: string;
    };

    // Call service layer
    const result = await loginUser(email, password);

    // Set httpOnly cookies
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, result.accessToken, accessCookieOptions());
    cookieStore.set(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions());

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken, // Also in cookie — sent here for clients that prefer header auth
        },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

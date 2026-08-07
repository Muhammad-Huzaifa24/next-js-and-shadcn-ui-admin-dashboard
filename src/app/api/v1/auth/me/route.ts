import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { getMe } from "@/services/auth.service";

export const runtime = "nodejs";

/**
 * GET /api/v1/auth/me
 *
 * Returns current user information based on access token cookie
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Get fresh user data from service
    const userData = await getMe(user.id);

    return NextResponse.json(
      {
        success: true,
        data: { user: userData },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { getRecentOrders } from "@/services/dashboard.service";

export const runtime = "nodejs";

/**
 * GET /api/v1/dashboard/recent-orders
 *
 * Get recent orders for dashboard widget
 * Query params: limit (default: 5, max: 20)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    let limit = 5; // default

    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (Number.isNaN(limit) || limit < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid limit parameter. Must be a positive integer.",
          },
          { status: 422 },
        );
      }
      // Cap at 20 as per milestone requirements
      limit = Math.min(limit, 20);
    }

    // Call service layer
    const orders = await getRecentOrders(limit);

    return NextResponse.json(
      {
        success: true,
        data: { orders },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

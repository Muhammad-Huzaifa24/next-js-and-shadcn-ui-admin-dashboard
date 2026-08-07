import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { getStats } from "@/services/dashboard.service";

export const runtime = "nodejs";

/**
 * GET /api/v1/dashboard/stats
 *
 * Get dashboard KPI statistics
 * Returns: totalRevenue, totalOrders, pendingOrders, totalProducts,
 *          lowStockProducts, totalCategories, totalCustomers, newCustomers
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    const stats = await getStats();

    return NextResponse.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

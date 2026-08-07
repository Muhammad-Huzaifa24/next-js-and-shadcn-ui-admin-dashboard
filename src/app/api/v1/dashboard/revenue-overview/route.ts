import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { getRevenueOverview } from '@/services/dashboard.service';

export const runtime = 'nodejs';

/**
 * GET /api/v1/dashboard/revenue-overview
 * 
 * Get revenue overview data for charts
 * Query params: range (3m|6m|12m, default: 12m)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') as '3m' | '6m' | '12m' || '12m';

    // Validate range parameter
    const validRanges = ['3m', '6m', '12m'];
    if (!validRanges.includes(range)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid range parameter. Must be: 3m, 6m, or 12m',
        },
        { status: 422 }
      );
    }

    // Call service layer
    const overview = await getRevenueOverview(range);

    return NextResponse.json(
      {
        success: true,
        data: { overview },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { validateRequest } from '@/middleware/validate';
import { bulkDeleteSchema } from '@/validators/order.schema';
import { bulkDeleteOrders } from '@/services/order.service';

export const runtime = 'nodejs';

/**
 * POST /api/v1/orders/bulk-delete
 * 
 * Delete multiple orders by IDs
 * Body: { ids: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate request body
    const validation = await validateRequest(request, bulkDeleteSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { ids } = validation.data as { ids: string[] };

    // Call service layer
    const result = await bulkDeleteOrders(ids);

    return NextResponse.json(
      {
        success: true,
        message: `${result.deletedCount} order(s) deleted`,
        data: result,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
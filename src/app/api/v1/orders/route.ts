import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { validateRequest } from '@/middleware/validate';
import { createOrderSchema } from '@/validators/order.schema';
import { listOrders, createOrder } from '@/services/order.service';

export const runtime = 'nodejs';

/**
 * GET /api/v1/orders
 * 
 * List orders with pagination, filtering, sorting
 * Query params: page, limit, sort, status, payment, customer, dateFrom, dateTo
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
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sort: searchParams.get('sort') || undefined,
      status: searchParams.get('status') || undefined,
      payment: searchParams.get('payment') || undefined,
      customer: searchParams.get('customer') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    };

    // Call service layer
    const result = await listOrders(params);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * POST /api/v1/orders
 * 
 * Create a new order
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
    const validation = await validateRequest(request, createOrderSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Call service layer
    const order = await createOrder(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: { order },
      },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
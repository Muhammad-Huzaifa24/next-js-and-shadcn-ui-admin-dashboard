import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { validateRequest } from '@/middleware/validate';
import { updateOrderSchema } from '@/validators/order.schema';
import { getOrder, updateOrder, deleteOrder } from '@/services/order.service';

export const runtime = 'nodejs';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/orders/[id]
 * 
 * Get a single order by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call service layer
    const order = await getOrder(params.id);

    return NextResponse.json(
      {
        success: true,
        data: { order },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * PUT /api/v1/orders/[id]
 * 
 * Update an order
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const validation = await validateRequest(request, updateOrderSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Call service layer
    const order = await updateOrder(params.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: { order },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * DELETE /api/v1/orders/[id]
 * 
 * Delete an order
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call service layer
    await deleteOrder(params.id);

    return NextResponse.json(
      { success: true, message: 'Order deleted' },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
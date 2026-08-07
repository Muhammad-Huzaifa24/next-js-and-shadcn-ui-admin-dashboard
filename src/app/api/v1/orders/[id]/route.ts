import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { validateRequest } from "@/middleware/validate";
import { deleteOrder, getOrder, updateOrder } from "@/services/order.service";
import { type UpdateOrderInput, updateOrderSchema } from "@/validators/order.schema";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/orders/[id]
 *
 * Get a single order by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    const order = await getOrder(id);

    return NextResponse.json(
      {
        success: true,
        data: { order },
      },
      { status: 200 },
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
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateRequest(request, updateOrderSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Call service layer
    const order = await updateOrder(id, validation.data as UpdateOrderInput);

    return NextResponse.json(
      {
        success: true,
        data: { order },
      },
      { status: 200 },
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
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    await deleteOrder(id);

    return NextResponse.json({ success: true, message: "Order deleted" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err);
  }
}

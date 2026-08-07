import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { validateRequest } from "@/middleware/validate";
import { setOrderStatus } from "@/services/order.service";
import { type PatchStatusInput, patchStatusSchema } from "@/validators/order.schema";

export const runtime = "nodejs";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/v1/orders/[id]/status
 *
 * Update only the order status (quick status change from table UI)
 * Body: { status: OrderStatus }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateRequest(request, patchStatusSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { status } = validation.data as PatchStatusInput;

    // Call service layer
    const order = await setOrderStatus(params.id, status);

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

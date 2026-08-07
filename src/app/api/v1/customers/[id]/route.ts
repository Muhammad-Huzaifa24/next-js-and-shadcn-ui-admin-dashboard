import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { validateRequest } from "@/middleware/validate";
import { deleteCustomer, getCustomer, updateCustomer } from "@/services/customer.service";
import { updateCustomerSchema } from "@/validators/customer.schema";

export const runtime = "nodejs";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/customers/[id]
 *
 * Get a single customer by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    const customer = await getCustomer(params.id);

    return NextResponse.json(
      {
        success: true,
        data: { customer },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * PUT /api/v1/customers/[id]
 *
 * Update a customer
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateRequest(request, updateCustomerSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Call service layer
    const customer = await updateCustomer(params.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: { customer },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * DELETE /api/v1/customers/[id]
 *
 * Delete a customer
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    await deleteCustomer(params.id);

    return NextResponse.json({ success: true, message: "Customer deleted" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err);
  }
}

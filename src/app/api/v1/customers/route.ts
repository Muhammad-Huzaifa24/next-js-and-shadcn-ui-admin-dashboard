import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { validateRequest } from "@/middleware/validate";
import { createCustomer, listCustomers } from "@/services/customer.service";
import { createCustomerSchema } from "@/validators/customer.schema";

export const runtime = "nodejs";

/**
 * GET /api/v1/customers
 *
 * List customers with pagination, filtering, sorting
 * Query params: page, limit, sort, segment, search
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
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const params = {
      page: pageParam ? parseInt(pageParam, 10) : undefined,
      limit: limitParam ? parseInt(limitParam, 10) : undefined,
      sort: searchParams.get("sort") || undefined,
      segment: searchParams.get("segment") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Call service layer
    const result = await listCustomers(params);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * POST /api/v1/customers
 *
 * Create a new customer
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateRequest(request, createCustomerSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Call service layer
    const customer = await createCustomer(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: { customer },
      },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

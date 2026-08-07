import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { validateRequest } from '@/middleware/validate';
import { createCustomerSchema } from '@/validators/customer.schema';
import { listCustomers, createCustomer } from '@/services/customer.service';

export const runtime = 'nodejs';

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
      segment: searchParams.get('segment') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Call service layer
    const result = await listCustomers(params);

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
 * POST /api/v1/customers
 * 
 * Create a new customer
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
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
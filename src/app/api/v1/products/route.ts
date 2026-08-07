import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/handle-error';
import { authenticate } from '@/middleware/authenticate';
import { validateRequest } from '@/middleware/validate';
import { createProductSchema } from '@/validators/product.schema';
import { listProducts, createProduct } from '@/services/product.service';

export const runtime = 'nodejs';

/**
 * GET /api/v1/products
 * 
 * List products with pagination, search, filtering, sorting
 * Query params: page, limit, sort, category, search
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
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Call service layer
    const result = await listProducts(params);

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
 * POST /api/v1/products
 * 
 * Create a new product
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
    const validation = await validateRequest(request, createProductSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Call service layer
    const product = await createProduct(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: { product },
      },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { validateRequest } from "@/middleware/validate";
import { deleteProduct, getProduct, patchProduct, updateProduct } from "@/services/product.service";
import { updateProductSchema } from "@/validators/product.schema";

export const runtime = "nodejs";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/products/[id]
 *
 * Get a single product by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    const product = await getProduct(params.id);

    return NextResponse.json(
      {
        success: true,
        data: { product },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * PUT /api/v1/products/[id]
 *
 * Update a product (full replace)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateRequest(request, updateProductSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Call service layer
    const product = await updateProduct(params.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: { product },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * PATCH /api/v1/products/[id]
 *
 * Partially update a product
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateRequest(request, updateProductSchema);
    if (!validation.success) {
      return validation.error;
    }

    // Call service layer
    const product = await patchProduct(params.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: { product },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * DELETE /api/v1/products/[id]
 *
 * Delete a product
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    await deleteProduct(params.id);

    return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err);
  }
}

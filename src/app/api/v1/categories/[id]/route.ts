import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { validateRequest } from "@/middleware/validate";
import { deleteCategory, getCategory, updateCategory } from "@/services/category.service";
import { updateCategorySchema } from "@/validators/category.schema";

export const runtime = "nodejs";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/v1/categories/[id]
 *
 * Get a single category by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    const category = await getCategory(params.id);

    return NextResponse.json(
      {
        success: true,
        data: { category },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * PUT /api/v1/categories/[id]
 *
 * Update a category
 * Supports both JSON and multipart/form-data (for image upload)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    let data: Record<string, unknown>;
    let file: File | undefined;

    // Handle both JSON and multipart/form-data
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      // Extract form fields
      data = {};
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          file = value;
        } else {
          data[key] = value;
        }
      }
    } else {
      data = await request.json();
    }

    // Validate core data (excluding file)
    const validation = await validateRequest(
      new Request(request.url, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      }),
      updateCategorySchema,
    );

    if (!validation.success) {
      return validation.error;
    }

    // Add file to the data if present
    const categoryData = { ...validation.data, file };

    // Call service layer
    const category = await updateCategory(params.id, categoryData);

    return NextResponse.json(
      {
        success: true,
        data: { category },
      },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * DELETE /api/v1/categories/[id]
 *
 * Delete a category
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Call service layer
    await deleteCategory(params.id);

    return NextResponse.json({ success: true, message: "Category deleted" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err);
  }
}

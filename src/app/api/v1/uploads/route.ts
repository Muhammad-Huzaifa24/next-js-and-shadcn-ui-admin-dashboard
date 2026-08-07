import { type NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/handle-error";
import { authenticate } from "@/middleware/authenticate";
import { deleteImage, uploadImages } from "@/services/upload.service";

export const runtime = "nodejs";

/**
 * POST /api/v1/uploads
 *
 * Upload multiple images to Cloudinary
 * Body: { images: string[] } - array of base64 data URLs
 * Returns: { urls: string[], publicIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { images } = body;

    // Call service layer
    const result = await uploadImages(images);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

/**
 * DELETE /api/v1/uploads
 *
 * Delete image from Cloudinary
 * Body: { publicId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { publicId } = body;

    // Call service layer
    await deleteImage(publicId);

    return NextResponse.json({ success: true, message: "Image deleted" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err);
  }
}

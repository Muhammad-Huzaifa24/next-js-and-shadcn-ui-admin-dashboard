import { cloudinary } from "@/config/cloudinary";
import { ServiceError } from "@/lib/service-error";

/**
 * Upload Service - Pure business logic extracted from Express upload controller
 * No Express/Next.js dependencies - only plain Node.js + Cloudinary
 */

// ─── Allowed base64 MIME prefixes ─────────────────────────────────────────────
const ALLOWED_PREFIXES = ["data:image/png;base64,", "data:image/jpeg;base64,", "data:image/webp;base64,"];

function isAllowedDataUrl(str: string): boolean {
  return ALLOWED_PREFIXES.some((p) => str.startsWith(p));
}

// ─── Upload a single base64 data URL to Cloudinary ───────────────────────────
async function uploadDataUrl(dataUrl: string): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: "studio-admin",
    resource_type: "image",
    overwrite: false,
    secure: true,
  });
  return {
    url: result.secure_url,
    publicId: result.public_id, // e.g. "studio-admin/abc123"
  };
}

export interface UploadResult {
  urls: string[];
  publicIds: string[];
}

export async function uploadImages(images: string[]): Promise<UploadResult> {
  if (!Array.isArray(images) || images.length === 0) {
    throw new ServiceError(400, "images must be a non-empty array of base64 data URLs");
  }

  if (images.length > 10) {
    throw new ServiceError(400, "Maximum 10 images per request");
  }

  // Validate every item before touching Cloudinary
  for (const img of images) {
    if (typeof img !== "string" || !isAllowedDataUrl(img)) {
      throw new ServiceError(400, "Each image must be a PNG, JPEG, or WebP base64 data URL");
    }
    // 7 MB cap: base64 is ~33% larger than binary, so 5MB binary ≈ 6.7MB base64
    if (img.length > 7 * 1024 * 1024) {
      throw new ServiceError(413, `Image too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 5} MB`);
    }
  }

  // Upload all in parallel
  const results = await Promise.all(images.map(uploadDataUrl));

  return {
    urls: results.map((r) => r.url),
    publicIds: results.map((r) => r.publicId),
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId || typeof publicId !== "string") {
    throw new ServiceError(400, "publicId is required");
  }

  // Only allow IDs we generated: "studio-admin/<hex>"
  if (!/^studio-admin\/[a-zA-Z0-9_-]+$/.test(publicId)) {
    throw new ServiceError(400, "Invalid publicId");
  }

  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result === "not found") {
    throw new ServiceError(404, "Image not found");
  }
}

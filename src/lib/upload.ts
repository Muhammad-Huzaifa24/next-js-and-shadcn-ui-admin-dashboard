/**
 * Upload utilities - mirrors BackEnd/src/utils/upload-image.js
 * Uses Cloudinary for image storage
 */

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (should be done once at app startup)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary.
 * Returns the secure HTTPS URL.
 *
 * @param {Buffer} buffer   - File buffer
 * @param {string} publicId - Safe random public_id (no extension)
 */
export function uploadBufferToCloudinary(buffer: Buffer, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "studio-admin",
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
        secure: true,
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  const result = await cloudinary.uploader.destroy(publicId);
  return result.result === "ok";
}

export { cloudinary };

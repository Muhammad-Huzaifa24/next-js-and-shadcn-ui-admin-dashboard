import { cloudinary } from "@/config/cloudinary";

/**
 * Upload a file buffer (from FormData or File.arrayBuffer()) to Cloudinary.
 * Returns the secure HTTPS URL.
 *
 * @param buffer   - File buffer (from Buffer.from(await file.arrayBuffer()))
 * @param publicId - Safe random public_id (no extension)
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
        resolve(result?.secure_url);
      },
    );
    stream.end(buffer);
  });
}

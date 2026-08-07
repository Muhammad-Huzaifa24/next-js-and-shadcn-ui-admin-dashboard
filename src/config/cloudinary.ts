import { v2 as cloudinary } from "cloudinary";

/**
 * Lazy-init Cloudinary singleton.
 *
 * Unlike the Express config which calls cloudinary.api.ping() on startup,
 * this version configures the instance on first import without making a
 * network request. This is appropriate for a serverless environment where
 * we don't want a cold-start ping on every deployment.
 *
 * Credentials are read from environment variables. The env validation in
 * src/lib/env.ts ensures all three are present before this module is used.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Test Cloudinary connection using API ping.
 * Returns boolean indicating success/failure.
 * Used by instrumentation.ts for startup connection verification.
 */
export async function testCloudinaryConnection(): Promise<boolean> {
  try {
    // Validate required environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const missing: string[] = [];
    if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
    if (!apiKey) missing.push("CLOUDINARY_API_KEY");
    if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

    if (missing.length > 0) {
      console.error(`[Cloudinary] Missing environment variables: ${missing.join(", ")}`);
      console.error("[Cloudinary] Please add these to your .env.local file");
      return false;
    }

    // Test connection with Cloudinary API
    const result = await cloudinary.api.ping();

    if (result.status === "ok") {
      console.log(`[Cloudinary] Using cloud: ${cloudName}`);
      return true;
    }
    console.error("[Cloudinary] API ping returned unexpected status:", result.status);
    return false;
  } catch (error) {
    // Connection failed - provide helpful error messages
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
      console.error("[Cloudinary] Authentication failed - check your API_KEY and API_SECRET");
    } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
      console.error("[Cloudinary] Access forbidden - verify your account permissions");
    } else if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      console.error("[Cloudinary] Cloud name not found - check your CLOUDINARY_CLOUD_NAME");
    } else {
      console.error("[Cloudinary] Connection test failed:", errorMessage);
    }

    return false;
  }
}

export { cloudinary };

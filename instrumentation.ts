/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the Next.js server starts (both dev and production).
 * Used for one-time Node.js-level setup that must happen before any
 * request is served.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run Node.js-specific setup in the Node.js runtime.
  // Next.js also runs instrumentation in the Edge runtime — guard against that.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Skip during build phase - only run at actual runtime
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.log("[instrumentation] Skipping during build phase");
      return;
    }

    /**
     * DNS resolution order fix for MongoDB Atlas SRV lookups on Windows and
     * some Linux configurations where IPv6 is preferred but Atlas only
     * responds on IPv4. Mirrors the fix in BackEnd/src/server.js.
     */
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");

    console.log("[instrumentation] DNS resolution order set to ipv4first");

    /**
     * Establish MongoDB connection at startup for immediate feedback
     * and to warm up the connection pool.
     */
    try {
      const { connectDB } = await import("./src/lib/db");
      await connectDB();
      console.log("[instrumentation] ✅ MongoDB connected successfully");

      // Seed admin user for development
      const { seedAdminUser } = await import("./src/scripts/seed");
      await seedAdminUser();
    } catch (error) {
      console.error("[instrumentation] ❌ MongoDB connection failed:", error instanceof Error ? error.message : error);
    }

    /**
     * Test Cloudinary connection at startup for immediate feedback
     * about image upload capabilities.
     */
    try {
      const { testCloudinaryConnection } = await import("./src/config/cloudinary");
      const isConnected = await testCloudinaryConnection();

      if (isConnected) {
        console.log("[instrumentation] ✅ Cloudinary connected successfully");
      } else {
        console.error("[instrumentation] ❌ Cloudinary connection failed");
      }
    } catch (error) {
      console.error("[instrumentation] ❌ Cloudinary setup error:", error instanceof Error ? error.message : error);
    }
  }
}

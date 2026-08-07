import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Health check endpoint to confirm the Next.js API is reachable
 *
 * GET /api/v1/health
 * Returns: { success: true, message: "Server is running" }
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: "Server is running",
    },
    { status: 200 },
  );
}

import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

/**
 * Validate request body against a Zod schema.
 *
 * Usage in a Route Handler:
 *   const data = await validateRequest(request, createProductSchema);
 *   if (!data.success) return data.error; // NextResponse 422
 *   // data.data is now typed as the schema type
 *
 * Returns { success: true, data: parsedData } or { success: false, error: NextResponse }
 */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema,
): Promise<
  | { success: true; data: T }
  | { success: false; error: NextResponse }
> {
  let body: unknown;

  try {
    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      // Convert FormData to object (only strings, not Files)
      body = Object.fromEntries(
        Array.from(formData.entries()).filter(([, value]) => typeof value === 'string'),
      );
    } else {
      body = await request.json();
    }
  } catch (err) {
    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          message: 'Invalid request body',
        },
        { status: 400 },
      ),
    };
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    }));

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors,
        },
        { status: 422 },
      ),
    };
  }

  return {
    success: true,
    data: result.data as T,
  };
}
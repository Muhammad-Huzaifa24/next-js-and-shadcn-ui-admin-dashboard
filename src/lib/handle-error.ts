import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

/**
 * Centralised Route Handler error converter.
 *
 * Replaces the 4-argument Express global error handler.
 * Each Route Handler calls this in its catch block:
 *
 *   } catch (err) {
 *     return handleRouteError(err);
 *   }
 */
export function handleRouteError(err: unknown): NextResponse {
  // Known service errors (thrown by service layer with an explicit statusCode)
  if (err instanceof ServiceError) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.statusCode },
    );
  }

  // Mongoose validation error → 422
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return NextResponse.json(
      { success: false, message: 'Validation failed', errors: messages },
      { status: 422 },
    );
  }

  // Mongoose duplicate key → 409
  if (isMongooseDuplicateKeyError(err)) {
    return NextResponse.json(
      { success: false, message: 'A record with that value already exists' },
      { status: 409 },
    );
  }

  // Mongoose cast error (bad ObjectId format) → 400
  if (err instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      { success: false, message: `Invalid value for field: ${err.path}` },
      { status: 400 },
    );
  }

  // Unknown errors — log server-side, return generic 500
  console.error('[handleRouteError]', err);
  return NextResponse.json(
    { success: false, message: 'An unexpected error occurred' },
    { status: 500 },
  );
}

// ---------------------------------------------------------------------------
// ServiceError — thrown by the service layer to signal HTTP-level failures
// ---------------------------------------------------------------------------

export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface MongoError {
  code?: number;
}

function isMongooseDuplicateKeyError(err: unknown): err is MongoError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as MongoError).code === 11000
  );
}

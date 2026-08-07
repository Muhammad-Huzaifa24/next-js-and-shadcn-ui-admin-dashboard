/**
 * ServiceError — thrown by service layer functions to signal HTTP-level responses.
 *
 * Services never deal with NextResponse directly. Instead they throw ServiceError
 * with a statusCode, which the Route Handler catches and converts to a NextResponse.
 *
 * Example:
 *   if (!user.comparePassword(password))
 *     throw new ServiceError(401, 'Invalid credentials');
 */

export class ServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

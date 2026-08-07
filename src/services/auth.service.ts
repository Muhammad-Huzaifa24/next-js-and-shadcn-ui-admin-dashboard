import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { ServiceError } from '@/lib/service-error';
import { signAccess, signRefresh } from '@/lib/jwt';
import type { IUser, SafeUser } from '@/types';

// Import User model (need to ensure models are created in FrontEnd)
import User from '@/models/User';

/**
 * Auth Service - Pure business logic extracted from Express auth controller
 * No Express/Next.js dependencies - only plain Node.js + Mongoose
 */

// Helper to create safe user object (never includes sensitive fields)
function safeUser(user: IUser): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
  };
}

export interface LoginResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Authenticate user with email/password
 * Uses constant-time comparison to prevent timing attacks
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  await connectDB();

  // Explicitly select passwordHash (select:false by default)
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash');

  // Constant-time: always run compare even if user not found to prevent
  // timing attacks that could enumerate valid emails
  const dummyHash = '$2a$12$invalidhashpaddingtomatchbcryptlength000000000000000000000';
  const isMatch = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, dummyHash);

  // Identical message whether email is wrong or password is wrong — no enumeration
  if (!user || !isMatch || !user.isActive) {
    throw new ServiceError(401, 'Invalid email or password');
  }

  const payload = { id: user._id, role: user.role };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  // Store hashed refresh token for future validation
  const salt = await bcrypt.genSalt(12);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    user: safeUser(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Logout user by clearing stored refresh token
 */
export async function logoutUser(userId: string): Promise<void> {
  await connectDB();
  
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }
}

/**
 * Get current user by ID
 */
export async function getMe(userId: string): Promise<SafeUser> {
  await connectDB();
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ServiceError(401, 'Authentication required');
  }

  return safeUser(user);
}

/**
 * Change user password
 * Validates current password and invalidates all refresh tokens
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<string> {
  await connectDB();

  const user = await User.findById(userId).select('+passwordHash +refreshTokenHash');
  if (!user) {
    throw new ServiceError(401, 'Authentication required');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ServiceError(401, 'Current password is incorrect');
  }

  // Set new password — pre-save hook will hash it (cost 12)
  user.passwordHash = newPassword;
  
  // Invalidate all existing refresh tokens on password change
  user.refreshTokenHash = null;
  
  await user.save();

  // Issue fresh access token so the user stays logged in after the change
  const payload = { id: user._id, role: user.role };
  return signAccess(payload);
}

/**
 * Refresh access token using refresh token
 * Implements token rotation for security
 */
export async function refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  await connectDB();

  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    throw new ServiceError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || !user.isActive) {
    throw new ServiceError(401, 'Invalid or expired refresh token');
  }

  const isValid = await user.compareRefreshToken(refreshToken);
  if (!isValid) {
    throw new ServiceError(401, 'Invalid or expired refresh token');
  }

  // Rotate: issue new pair and store new refresh hash
  const payload = { id: user._id, role: user.role };
  const newAccessToken = signAccess(payload);
  const newRefreshToken = signRefresh(payload);
  
  const salt = await bcrypt.genSalt(12);
  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, salt);
  await user.save({ validateBeforeSave: false });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
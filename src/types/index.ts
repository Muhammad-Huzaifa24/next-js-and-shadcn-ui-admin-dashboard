/**
 * Shared TypeScript types for the full-stack Next.js app.
 *
 * These types are used by services, Route Handlers, and client-side code.
 * They mirror the Mongoose document shapes but strip out Mongoose-specific
 * fields (_id, __v, timestamps) in the "Safe" variants returned to clients.
 */

import type { Document } from "mongoose";

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "administrator";
  isActive: boolean;
  lastLoginAt: Date | null;
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  compareRefreshToken(candidate: string): Promise<boolean>;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "administrator";
  isActive: boolean;
  lastLoginAt: string | null;
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface ProductOption {
  type: string;
  values: string[];
}

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  inventory: number;
  color: string;
  price: string;
  discountPrice: string;
  hasTax: boolean;
  images: string[];
  hasOptions: boolean;
  options: ProductOption[];
  weight: string;
  country: string;
  isDigital: boolean;
  tags: string[];
  seoTitle: string;
  seoDesc: string;
  rating: number;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface ICategory extends Document {
  name: string;
  count: number;
  unit: string;
  color: string;
  initials: string;
  image: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

export type PaymentStatus = "Paid" | "Pending" | "Refunded";
export type OrderStatus = "Ready" | "Shipped" | "Delivered" | "Cancelled";

export interface IOrder extends Document {
  date: Date;
  customer: string;
  payment: PaymentStatus;
  status: OrderStatus;
  total: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Customer
// ---------------------------------------------------------------------------

export type CustomerSegment = "all" | "new" | "europe" | "returning";

export interface ICustomer extends Document {
  name: string;
  location: string;
  orders: number;
  spent: string;
  segment: CustomerSegment;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

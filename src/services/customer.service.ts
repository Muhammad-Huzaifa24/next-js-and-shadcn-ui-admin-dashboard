import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { ServiceError } from "@/lib/service-error";
import type { Pagination } from "@/types";

import Customer from "../models/customer";

/**
 * Customer Service - Pure business logic extracted from Express customer controller
 * No Express/Next.js dependencies - only plain Node.js + Mongoose
 */

export interface CustomerListParams {
  page?: number;
  limit?: number;
  sort?: string;
  segment?: string;
  search?: string;
}

import type { ICustomer } from "@/types";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/validators/customer.schema";

export interface CustomerListResult {
  customers: ICustomer[];
  pagination: Pagination;
}

export async function listCustomers(params: CustomerListParams = {}): Promise<CustomerListResult> {
  await connectDB();

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(200, Math.max(1, params.limit ?? 200));
  const skip = (page - 1) * limit;

  const SORT_MAP = {
    name_asc: { name: 1 },
    name_desc: { name: -1 },
    spent_asc: { spent: 1 },
    spent_desc: { spent: -1 },
    newest: { createdAt: -1 },
  };
  const sort = (SORT_MAP as Record<string, any>)[params.sort ?? "newest"] ?? SORT_MAP.newest;

  const filter: Record<string, any> = {};
  if (params.segment) filter.segment = params.segment.trim();
  if (params.search) filter.name = { $regex: params.search.trim(), $options: "i" };

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);

  return {
    customers,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCustomer(id: string): Promise<ICustomer> {
  await connectDB();

  const customer = await Customer.findById(id).lean();
  if (!customer) {
    throw new ServiceError(404, "Customer not found");
  }
  return customer;
}

export async function createCustomer(data: CreateCustomerInput): Promise<ICustomer> {
  await connectDB();

  try {
    const customer = await Customer.create(data);
    return customer;
  } catch (err: unknown) {
    // Check for duplicate key error (MongoDB error code 11000)
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      throw new ServiceError(409, "A customer with that email already exists");
    }
    // Check for validation error
    if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && "message" in err) {
      throw new ServiceError(422, String(err.message));
    }
    throw err;
  }
}

export async function updateCustomer(id: string, data: UpdateCustomerInput): Promise<ICustomer> {
  await connectDB();

  try {
    const customer = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!customer) {
      throw new ServiceError(404, "Customer not found");
    }
    return customer;
  } catch (err: unknown) {
    // Check for duplicate key error (MongoDB error code 11000)
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      throw new ServiceError(409, "A customer with that email already exists");
    }
    // Check for validation error
    if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && "message" in err) {
      throw new ServiceError(422, String(err.message));
    }
    throw err;
  }
}

export async function deleteCustomer(id: string): Promise<void> {
  await connectDB();

  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) {
    throw new ServiceError(404, "Customer not found");
  }
}

export async function bulkDeleteCustomers(ids: string[]): Promise<{ deletedCount: number }> {
  await connectDB();

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const result = await Customer.deleteMany({ _id: { $in: objectIds } });

  return { deletedCount: result.deletedCount };
}

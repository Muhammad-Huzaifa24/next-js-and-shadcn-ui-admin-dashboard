import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { ServiceError } from "@/lib/service-error";
import type { OrderStatus, Pagination } from "@/types";

import Order from "../models/order";

/**
 * Order Service - Pure business logic extracted from Express order controller
 * No Express/Next.js dependencies - only plain Node.js + Mongoose
 */

export interface OrderListParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: string;
  payment?: string;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderListResult {
  orders: any[];
  pagination: Pagination;
}

export async function listOrders(params: OrderListParams = {}): Promise<OrderListResult> {
  await connectDB();

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const SORT_MAP = {
    newest: { date: -1 },
    oldest: { date: 1 },
    total_asc: { total: 1 },
    total_desc: { total: -1 },
  };
  const sort = (SORT_MAP as any)[params.sort ?? "newest"] ?? SORT_MAP.newest;

  const filter: any = {};

  if (params.status) filter.status = params.status.trim();
  if (params.payment) filter.payment = params.payment.trim();
  if (params.customer) filter.customer = { $regex: params.customer.trim(), $options: "i" };

  // Date range: both sides optional
  if (params.dateFrom || params.dateTo) {
    filter.date = {};
    if (params.dateFrom) filter.date.$gte = new Date(params.dateFrom);
    if (params.dateTo) filter.date.$lte = new Date(params.dateTo);
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getOrder(id: string): Promise<any> {
  await connectDB();

  const order = await Order.findById(id).lean();
  if (!order) {
    throw new ServiceError(404, "Order not found");
  }
  return order;
}

export async function createOrder(data: any): Promise<any> {
  await connectDB();

  try {
    const order = await Order.create(data);
    return order;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && "message" in err) {
      throw new ServiceError(422, String(err.message));
    }
    throw err;
  }
}

export async function updateOrder(id: string, data: any): Promise<any> {
  await connectDB();

  try {
    const order = await Order.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!order) {
      throw new ServiceError(404, "Order not found");
    }
    return order;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && "message" in err) {
      throw new ServiceError(422, String(err.message));
    }
    throw err;
  }
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<any> {
  await connectDB();

  try {
    // Only allow the status field — strip everything else
    const order = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true });
    if (!order) {
      throw new ServiceError(404, "Order not found");
    }
    return order;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && "message" in err) {
      throw new ServiceError(422, String(err.message));
    }
    throw err;
  }
}

export async function deleteOrder(id: string): Promise<void> {
  await connectDB();

  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    throw new ServiceError(404, "Order not found");
  }
}

export async function bulkDeleteOrders(ids: string[]): Promise<{ deletedCount: number }> {
  await connectDB();

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const result = await Order.deleteMany({ _id: { $in: objectIds } });

  return { deletedCount: result.deletedCount };
}

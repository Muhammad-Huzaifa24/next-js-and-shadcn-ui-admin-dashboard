import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { ServiceError } from "@/lib/service-error";
import Product from "@/models/product";
import type { Pagination } from "@/types";

/**
 * Product Service - Pure business logic extracted from Express product controller
 * No Express/Next.js dependencies - only plain Node.js + Mongoose
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

const SORT_MAP = {
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

export interface ProductListParams {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  search?: string;
}

import type { IProduct } from "@/types";
import type { CreateProductInput, UpdateProductInput } from "@/validators/product.schema";

export interface ProductListResult {
  products: IProduct[];
  pagination: Pagination;
}

export async function listProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  await connectDB();

  const page = Math.max(1, params.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit ?? DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  const sortKey = params.sort ?? "newest";
  const sort = (SORT_MAP as Record<string, any>)[sortKey] ?? SORT_MAP.newest;

  const filter: Record<string, any> = {};

  // Category filter
  if (params.category) {
    filter.category = params.category.trim();
  }

  // Full-text search (uses the text index on name + description + tags)
  if (params.search) {
    filter.$text = { $search: params.search.trim().slice(0, 200) };
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProduct(id: string): Promise<IProduct> {
  await connectDB();

  const product = await Product.findById(id).lean();
  if (!product) {
    throw new ServiceError(404, "Product not found");
  }
  return product;
}

export async function createProduct(data: CreateProductInput): Promise<IProduct> {
  await connectDB();

  try {
    const product = await Product.create(data);
    return product;
  } catch (err: any) {
    // Duplicate key or validation errors surface with a clear message
    if (err.code === 11000 || err.name === "ValidationError") {
      throw new ServiceError(422, err.message);
    }
    throw err;
  }
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<IProduct> {
  await connectDB();

  try {
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true, overwrite: true });
    if (!product) {
      throw new ServiceError(404, "Product not found");
    }
    return product;
  } catch (err: any) {
    if (err.name === "ValidationError") {
      throw new ServiceError(422, err.message);
    }
    throw err;
  }
}

export async function patchProduct(id: string, data: any): Promise<any> {
  await connectDB();

  try {
    const product = await Product.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!product) {
      throw new ServiceError(404, "Product not found");
    }
    return product;
  } catch (err: any) {
    if (err.name === "ValidationError") {
      throw new ServiceError(422, err.message);
    }
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  await connectDB();

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ServiceError(404, "Product not found");
  }
}

export async function bulkDeleteProducts(ids: string[]): Promise<{ deletedCount: number }> {
  await connectDB();

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const result = await Product.deleteMany({ _id: { $in: objectIds } });

  return { deletedCount: result.deletedCount };
}

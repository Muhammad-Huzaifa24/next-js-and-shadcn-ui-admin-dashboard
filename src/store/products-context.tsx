"use client";

import * as React from "react";

import { productsApi } from "@/lib/api";

export type ProductOption = {
  type: string;
  values: string[];
};

export type ProductRow = {
  id: string;
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
};

interface ProductsContextValue {
  products: ProductRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProduct: (product: Omit<ProductRow, "id">) => Promise<void>;
  updateProduct: (id: string, patch: Partial<ProductRow>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
}

const ProductsContext = React.createContext<ProductsContextValue | null>(null);

function mapProduct(raw: unknown): ProductRow {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r._id ?? r.id ?? ""),
    name: String(r.name ?? ""),
    description: String(r.description ?? ""),
    category: String(r.category ?? ""),
    inventory: Number(r.inventory ?? 0),
    color: String(r.color ?? ""),
    price: String(r.price ?? "0"),
    discountPrice: String(r.discountPrice ?? "0"),
    hasTax: Boolean(r.hasTax),
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    hasOptions: Boolean(r.hasOptions),
    options: Array.isArray(r.options) ? (r.options as ProductOption[]) : [],
    weight: String(r.weight ?? ""),
    country: String(r.country ?? ""),
    isDigital: Boolean(r.isDigital),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    seoTitle: String(r.seoTitle ?? ""),
    seoDesc: String(r.seoDesc ?? ""),
    rating: Number(r.rating ?? 0),
    votes: Number(r.votes ?? 0),
  };
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<ProductRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productsApi.list({ limit: "200" });
      setProducts((res.data.products as unknown[]).map(mapProduct));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addProduct(data: Omit<ProductRow, "id">) {
    const res = await productsApi.create(data);
    setProducts((prev) => [...prev, mapProduct(res.data.product)]);
  }

  async function updateProduct(id: string, patch: Partial<ProductRow>) {
    const res = await productsApi.update(id, patch);
    setProducts((prev) => prev.map((p) => (p.id === id ? mapProduct(res.data.product) : p)));
  }

  async function deleteProduct(id: string) {
    await productsApi.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function bulkDeleteProducts(ids: string[]) {
    await productsApi.bulkDelete(ids);
    const set = new Set(ids);
    setProducts((prev) => prev.filter((p) => !set.has(p.id)));
  }

  return (
    <ProductsContext
      value={{ products, loading, error, refresh, addProduct, updateProduct, deleteProduct, bulkDeleteProducts }}
    >
      {children}
    </ProductsContext>
  );
}

export function useProducts(): ProductsContextValue {
  const ctx = React.use(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}

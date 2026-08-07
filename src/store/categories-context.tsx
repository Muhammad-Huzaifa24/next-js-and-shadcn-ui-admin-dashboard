"use client";

import * as React from "react";

import { categoriesApi } from "@/lib/api";

export type CategoryItem = {
  id: string;
  name: string;
  description: string;
  count: number;
  unit: string;
  color: string;
  initials: string;
  image?: string;
};

interface CategoriesContextValue {
  categories: CategoryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCategory: (cat: Omit<CategoryItem, "id">) => Promise<void>;
  updateCategory: (id: string, patch: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  bulkDeleteCategories: (ids: string[]) => Promise<void>;
}

const CategoriesContext = React.createContext<CategoriesContextValue | null>(null);

function mapCategory(raw: unknown): CategoryItem {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r._id ?? r.id ?? ""),
    name: String(r.name ?? ""),
    description: String(r.description ?? ""),
    count: Number(r.count ?? 0),
    unit: String(r.unit ?? ""),
    color: String(r.color ?? ""),
    initials: String(r.initials ?? ""),
    image: r.image ? String(r.image) : undefined,
  };
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoriesApi.list();
      setCategories((res.data.categories as unknown[]).map(mapCategory));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addCategory(data: Omit<CategoryItem, "id">) {
    const res = await categoriesApi.create(data);
    setCategories((prev) => [...prev, mapCategory(res.data.category)]);
  }

  async function updateCategory(id: string, patch: Partial<CategoryItem>) {
    const res = await categoriesApi.update(id, patch);
    setCategories((prev) => prev.map((c) => (c.id === id ? mapCategory(res.data.category) : c)));
  }

  async function deleteCategory(id: string) {
    await categoriesApi.remove(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  async function bulkDeleteCategories(ids: string[]) {
    await categoriesApi.bulkDelete(ids);
    const set = new Set(ids);
    setCategories((prev) => prev.filter((c) => !set.has(c.id)));
  }

  return (
    <CategoriesContext
      value={{ categories, loading, error, refresh, addCategory, updateCategory, deleteCategory, bulkDeleteCategories }}
    >
      {children}
    </CategoriesContext>
  );
}

export function useCategories(): CategoriesContextValue {
  const ctx = React.use(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}

"use client";

import * as React from "react";

import { storageGet, storageSet } from "./storage";
import { STORAGE_KEYS } from "./storage-keys";

export type CategoryItem = {
  id: string;
  name: string;
  count: number;
  unit: string;
  color: string;
  initials: string;
  image?: string; // base64 data URL
};

interface CategoriesContextValue {
  categories: CategoryItem[];
  addCategory: (cat: Omit<CategoryItem, "id">) => void;
  updateCategory: (id: string, patch: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;
  bulkDeleteCategories: (ids: string[]) => void;
}

const CategoriesContext = React.createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<CategoryItem[]>(() => {
    return storageGet<CategoryItem[]>(STORAGE_KEYS.CATEGORIES) ?? [];
  });

  function persist(next: CategoryItem[]) {
    setCategories(next);
    storageSet(STORAGE_KEYS.CATEGORIES, next);
  }

  function addCategory(data: Omit<CategoryItem, "id">) {
    persist([...categories, { ...data, id: `cat${Date.now()}` }]);
  }

  function updateCategory(id: string, patch: Partial<CategoryItem>) {
    persist(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function deleteCategory(id: string) {
    persist(categories.filter((c) => c.id !== id));
  }

  function bulkDeleteCategories(ids: string[]) {
    const set = new Set(ids);
    persist(categories.filter((c) => !set.has(c.id)));
  }

  return (
    <CategoriesContext value={{ categories, addCategory, updateCategory, deleteCategory, bulkDeleteCategories }}>
      {children}
    </CategoriesContext>
  );
}

export function useCategories(): CategoriesContextValue {
  const ctx = React.use(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}

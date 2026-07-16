"use client";

import * as React from "react";

import { storageGet, storageSet } from "./storage";
import { STORAGE_KEYS } from "./storage-keys";

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  inventory: number;
  color: string;
  price: string;
  rating: number;
  votes: number;
};

interface ProductsContextValue {
  products: ProductRow[];
  addProduct: (product: Omit<ProductRow, "id">) => void;
  updateProduct: (id: string, patch: Partial<ProductRow>) => void;
  deleteProduct: (id: string) => void;
}

const ProductsContext = React.createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<ProductRow[]>(() => {
    return storageGet<ProductRow[]>(STORAGE_KEYS.PRODUCTS) ?? [];
  });

  function persist(next: ProductRow[]) {
    setProducts(next);
    storageSet(STORAGE_KEYS.PRODUCTS, next);
  }

  function addProduct(data: Omit<ProductRow, "id">) {
    persist([...products, { ...data, id: `p${Date.now()}` }]);
  }

  function updateProduct(id: string, patch: Partial<ProductRow>) {
    persist(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function deleteProduct(id: string) {
    persist(products.filter((p) => p.id !== id));
  }

  return <ProductsContext value={{ products, addProduct, updateProduct, deleteProduct }}>{children}</ProductsContext>;
}

export function useProducts(): ProductsContextValue {
  const ctx = React.use(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}

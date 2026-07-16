"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductRow } from "@/store/products-context";

interface CategoryProductsListProps {
  products: ProductRow[];
}

export function CategoryProductsList({ products }: CategoryProductsListProps) {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <h2 className="font-medium text-sm">Products</h2>
        <span className="text-muted-foreground text-sm">{products.length}</span>
      </div>
      {products.length === 0 ? (
        <p className="px-4 py-8 text-center text-muted-foreground text-sm">No products in this category.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li
              key={product.id}
              className="group flex items-center gap-3 border-b px-4 py-3 transition-colors last:border-0 hover:bg-muted/30"
            >
              <div className="flex shrink-0 flex-col gap-0.5">
                <span className="block h-0.5 w-3.5 rounded-full bg-muted-foreground/40" />
                <span className="block h-0.5 w-3.5 rounded-full bg-muted-foreground/40" />
                <span className="block h-0.5 w-3.5 rounded-full bg-muted-foreground/40" />
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs">
                {product.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="flex-1 font-medium text-sm">{product.name}</span>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="icon-sm" variant="ghost" aria-label={`Edit ${product.name}`}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Delete ${product.name}`}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

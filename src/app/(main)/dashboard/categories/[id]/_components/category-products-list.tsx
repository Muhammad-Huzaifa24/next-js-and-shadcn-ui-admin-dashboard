"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { ProductModal } from "@/app/(main)/dashboard/products/_components/product-modal";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { type ProductRow, useProducts } from "@/store/products-context";

interface CategoryProductsListProps {
  products: ProductRow[];
}

export function CategoryProductsList({ products }: CategoryProductsListProps) {
  const router = useRouter();
  const { deleteProduct } = useProducts();

  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [viewProduct, setViewProduct] = React.useState<ProductRow | null>(null);

  function confirmDeletion() {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <>
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
                {/* Drag handle */}
                <div className="flex shrink-0 flex-col gap-0.5">
                  <span className="block h-0.5 w-3.5 rounded-full bg-muted-foreground/40" />
                  <span className="block h-0.5 w-3.5 rounded-full bg-muted-foreground/40" />
                  <span className="block h-0.5 w-3.5 rounded-full bg-muted-foreground/40" />
                </div>

                {/* Avatar / image */}
                {product.images?.[0] ? (
                  // biome-ignore lint/performance/noImgElement: base64 preview
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="size-10 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs">
                    {product.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Name */}
                <span className="flex-1 font-medium text-sm">{product.name}</span>

                {/* Actions — visible on hover */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* View */}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`View ${product.name}`}
                    onClick={() => setViewProduct(product)}
                  >
                    <Eye className="size-3.5" />
                  </Button>

                  {/* Edit */}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Edit ${product.name}`}
                    onClick={() => router.push(`/dashboard/products/edit/${product.id}`)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>

                  {/* Delete */}
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Delete ${product.name}`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* View modal */}
      <ProductModal product={viewProduct} onClose={() => setViewProduct(null)} />

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        label={deleteTarget ? `"${deleteTarget.name}"` : ""}
        onConfirm={confirmDeletion}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

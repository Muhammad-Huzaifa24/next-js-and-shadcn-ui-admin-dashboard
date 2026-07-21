"use client";

import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ProductRow } from "@/store/products-context";

interface ProductModalProps {
  product: ProductRow | null;
  onClose: () => void;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right font-medium text-sm">{children}</span>
    </div>
  );
}

function StockBadge({ inventory }: { inventory: number }) {
  if (inventory > 50)
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        In Stock
      </Badge>
    );
  if (inventory > 0)
    return (
      <Badge
        className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Low Stock
      </Badge>
    );
  return (
    <Badge variant="destructive">
      <span className="size-1.5 rounded-full bg-current" />
      Out of Stock
    </Badge>
  );
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  return (
    <Dialog
      open={!!product}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>

        {/* Header — image/avatar + name + description */}
        <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
          {product.images?.[0] ? (
            // biome-ignore lint/performance/noImgElement: base64 preview
            <img src={product.images[0]} alt={product.name} className="size-12 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-muted-foreground text-sm">
              {product.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold leading-none">{product.name}</p>
            <p className="mt-1 text-muted-foreground text-xs">{product.category}</p>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">{product.description}</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="divide-y divide-border/60">
          <InfoRow label="Price">
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-semibold text-base tabular-nums">{product.price}</span>
              {product.discountPrice && (
                <span className="text-muted-foreground text-xs line-through">{product.discountPrice}</span>
              )}
            </div>
          </InfoRow>
          <InfoRow label="Color">{product.color || "—"}</InfoRow>
          <InfoRow label="Inventory">
            <div className="flex items-center gap-2">
              <span className="tabular-nums">{product.inventory} in stock</span>
              <StockBadge inventory={product.inventory} />
            </div>
          </InfoRow>
          <InfoRow label="Category">
            <Badge variant="secondary">{product.category}</Badge>
          </InfoRow>
          {product.tags?.length > 0 && (
            <InfoRow label="Tags">
              <div className="flex flex-wrap justify-end gap-1">
                {product.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </InfoRow>
          )}
          <InfoRow label="Rating">
            <div className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">({product.votes} votes)</span>
            </div>
          </InfoRow>
        </div>

        <Separator />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { use } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Pencil, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/store/products-context";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ViewProductPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { products } = useProducts();

  const product = products.find((p) => p.id === id);

  React.useEffect(() => {
    if (!product) router.back();
  }, [product, router]);

  if (!product) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex w-fit cursor-pointer items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </button>
          <h1 className="text-3xl leading-none tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground text-sm">{product.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/products/edit/${product.id}`}>
              <Pencil className="size-3.5" />
              Edit Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* ── Left column ── */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* Media */}
          {product.images?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {product.images.map((src, i) => (
                    <div key={src.slice(-20)} className="aspect-square overflow-hidden rounded-lg border bg-muted">
                      {/* biome-ignore lint/performance/noImgElement: base64 preview */}
                      <img src={src} alt={`${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-medium text-sm">Title</p>
                <p className="text-muted-foreground text-sm">{product.name}</p>
              </div>
              {product.description && (
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-sm">Description</p>
                  {/* biome-ignore lint/security/noDangerouslySetInnerHtml: content is sanitized server-side */}
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:pl-4"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                <Row label="Price" value={product.price} />
                {product.discountPrice && (
                  <Row
                    label="Discount Price"
                    value={<span className="text-muted-foreground line-through">{product.discountPrice}</span>}
                  />
                )}
                <Row label="Tax" value={product.hasTax ? "Included" : "Not included"} />
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          {product.hasOptions && product.options?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Options</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {product.options.map((opt) => (
                  <div key={opt.type} className="flex flex-col gap-1.5">
                    <p className="font-medium text-sm">{opt.type}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {opt.values.map((v) => (
                        <Badge key={v} variant="secondary">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                <Row label="Type" value={product.isDigital ? "Digital" : "Physical"} />
                {!product.isDigital && product.weight && <Row label="Weight" value={`${product.weight} kg`} />}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4">
          {/* Category & Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{product.category}</Badge>
            </CardContent>
          </Card>

          {product.tags?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((t) => (
                    <Badge key={t} variant="outline" className="gap-1">
                      <Tag className="size-3" />
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO */}
          {(product.seoTitle || product.seoDesc) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SEO</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {product.seoTitle && (
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">Title</p>
                    <p className="text-muted-foreground text-sm">{product.seoTitle}</p>
                  </div>
                )}
                {product.seoDesc && (
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">Description</p>
                    <p className="text-muted-foreground text-sm">{product.seoDesc}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right font-medium text-sm">{value}</span>
    </div>
  );
}

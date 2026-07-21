"use client";

import * as React from "react";
import { use } from "react";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCategories } from "@/store/categories-context";
import { useProducts } from "@/store/products-context";

import { CategoryInfoPanel, type CategoryInfoPanelRef } from "./_components/category-info-panel";
import { CategoryProductsList } from "./_components/category-products-list";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CategoryDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { categories, updateCategory } = useCategories();
  const { products } = useProducts();

  const panelRef = React.useRef<CategoryInfoPanelRef | null>(null);

  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  const categoryProducts = products.filter((p) => p.category.toLowerCase() === category.name.toLowerCase());

  function handleSave() {
    const values = panelRef.current?.getValues();
    if (!values) return;
    if (!values.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    updateCategory(category!.id, { name: values.name.trim(), image: values.image });
    toast.success("Category saved.");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
            <Link href="/dashboard/categories">
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl leading-none tracking-tight">{category.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/categories")}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CategoryProductsList products={categoryProducts} />
        </div>
        <div>
          <CategoryInfoPanel category={category} panelRef={panelRef} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { use } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCategories } from "@/store/categories-context";
import { useProducts } from "@/store/products-context";

import { CategoryInfoPanel } from "./_components/category-info-panel";
import { CategoryProductsList } from "./_components/category-products-list";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CategoryDetailPage({ params }: Props) {
  const { id } = use(params);
  const { categories } = useCategories();
  const { products } = useProducts();

  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  const categoryProducts = products.filter((p) => p.category.toLowerCase() === category.name.toLowerCase());

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
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/categories">Cancel</Link>
          </Button>
          <Button size="sm">Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CategoryProductsList products={categoryProducts} />
        </div>
        <div>
          <CategoryInfoPanel name={category.name} />
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { use } from "react";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { categoriesApi } from "@/lib/api";
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
  const { categories, refresh } = useCategories();
  const { products } = useProducts();

  const [saving, setSaving] = React.useState(false);
  const panelRef = React.useRef<CategoryInfoPanelRef | null>(null);

  const category = categories.find((c) => c.id === id);

  React.useEffect(() => {
    if (!category) router.back();
  }, [category, router]);

  if (!category) return null;

  const categoryProducts = products.filter((p) => p.category.toLowerCase() === category.name.toLowerCase());

  async function handleSave() {
    const values = panelRef.current?.getValues();
    if (!values) return;
    if (!values.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setSaving(true);
    try {
      // Always use FormData so the image arrives as a real file (not base64)
      const form = new FormData();
      form.append("name", values.name.trim());

      if (values.imageFile) {
        // User picked a new image — send the File so BE uploads it to Cloudinary
        form.append("image", values.imageFile);
      }
      // If no new file, omit "image" entirely — BE will leave the existing URL untouched

      await categoriesApi.updateWithForm(category?.id, form);
      await refresh(); // sync the context with the fresh data from DB
      toast.success("Category saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
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
          <h1 className="text-3xl leading-none tracking-tight">{category.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={saving} onClick={() => router.push("/dashboard/categories")}>
            Cancel
          </Button>
          <Button size="sm" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save"}
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

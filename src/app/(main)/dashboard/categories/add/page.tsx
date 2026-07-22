"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AddCategoryForm } from "./_components/add-category-form";

export default function AddCategoryPage() {
  const router = useRouter();

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
          <h1 className="text-3xl leading-none tracking-tight">Add Category</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" form="add-category-form" size="sm">
            Save
          </Button>
        </div>
      </div>
      <AddCategoryForm />
    </div>
  );
}

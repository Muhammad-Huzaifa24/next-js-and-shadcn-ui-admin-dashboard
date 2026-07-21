import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AddCategoryForm } from "./_components/add-category-form";

export default function AddCategoryPage() {
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
          <h1 className="text-3xl leading-none tracking-tight">Add Category</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/categories">Cancel</Link>
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

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AddProductForm } from "./_components/add-product-form";

export default function AddProductPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
            <Link href="/dashboard/products">
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl leading-none tracking-tight">Add Product</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">Cancel</Link>
          </Button>
          <Button size="sm">Save</Button>
        </div>
      </div>
      <AddProductForm />
    </div>
  );
}

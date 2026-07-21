import Link from "next/link";

import { Plus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

import { ProductsTable } from "./_components/products-table";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Products"
        actions={
          <Button size="sm" asChild>
            <Link href="/dashboard/products/add">
              <Plus className="size-3.5" />
              Add Product
            </Link>
          </Button>
        }
      />
      <ProductsTable />
    </div>
  );
}

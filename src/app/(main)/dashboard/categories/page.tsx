"use client";

import Link from "next/link";

import { Plus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

import { CategoriesTable } from "./_components/categories-table";

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Categories"
        actions={
          <Button size="sm" asChild>
            <Link href="/dashboard/categories/add">
              <Plus className="size-3.5" />
              Add Category
            </Link>
          </Button>
        }
      />
      <CategoriesTable />
    </div>
  );
}

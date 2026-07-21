"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { FolderOpen, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { DataTable } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { type CategoryItem, useCategories } from "@/store/categories-context";
import { useProducts } from "@/store/products-context";

function buildColumns(onDelete: (id: string) => void): ColumnDef<CategoryItem>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.image ? (
            // biome-ignore lint/performance/noImgElement: base64 preview
            <img src={row.original.image} alt={row.original.name} className="size-9 shrink-0 rounded-md object-cover" />
          ) : (
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-md font-bold text-white/90 text-xs",
                row.original.color,
              )}
            >
              {row.original.initials}
            </div>
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
      filterFn: (row, _id, value: string) => row.original.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      accessorKey: "count",
      header: "Products",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.count} {row.original.unit}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: () => (
        <Badge
          className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
          variant="outline"
        >
          <span className="size-1.5 rounded-full bg-current" />
          Active
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button aria-label="Category actions" size="icon-sm" variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/categories/${row.original.id}`}>View products</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row.original.id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export function CategoriesTable() {
  const router = useRouter();
  const { categories, deleteCategory, bulkDeleteCategories } = useCategories();
  const { products } = useProducts();

  // Compute live product count per category
  const categoriesWithCount = React.useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        count: products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length,
      })),
    [categories, products],
  );
  const [deleteTarget, setDeleteTarget] = React.useState<{ ids: string[]; label: string } | null>(null);
  const [clearTrigger, setClearTrigger] = React.useState(0);

  function handleDelete(id: string) {
    const name = categories.find((c) => c.id === id)?.name ?? "category";
    setDeleteTarget({ ids: [id], label: `"${name}"` });
  }

  function handleDeleteSelected(ids: string[]) {
    setDeleteTarget({ ids, label: `${ids.length} categor${ids.length > 1 ? "ies" : "y"}` });
  }

  function confirmDeletion() {
    if (!deleteTarget) return;
    if (deleteTarget.ids.length === 1) {
      deleteCategory(deleteTarget.ids[0]);
    } else {
      bulkDeleteCategories(deleteTarget.ids);
    }
    toast.success(`${deleteTarget.ids.length > 1 ? `${deleteTarget.ids.length} categories` : "Category"} deleted`);
    setClearTrigger((n) => n + 1);
    setDeleteTarget(null);
  }

  const handleDeleteRef = React.useRef(handleDelete);
  handleDeleteRef.current = handleDelete;

  const columns = React.useMemo(() => buildColumns((id) => handleDeleteRef.current(id)), []);

  return (
    <>
      <DataTable
        data={categoriesWithCount}
        columns={columns}
        searchColumn="name"
        searchPlaceholder="Search categories..."
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            icon={FolderOpen}
            title="No categories yet"
            description="Add your first category to get started."
          />
        }
        onDeleteSelected={handleDeleteSelected}
        clearSelectionTrigger={clearTrigger}
        onRowClick={(row) => router.push(`/dashboard/categories/${row.id}`)}
      />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        label={deleteTarget?.label ?? ""}
        onConfirm={confirmDeletion}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

"use client";

import * as React from "react";

import Link from "next/link";

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
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-md font-bold text-white/90 text-xs",
              row.original.color,
            )}
          >
            {row.original.initials}
          </div>
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
                  onClick={() => onDelete(row.original.id)}
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
  const { categories, deleteCategory } = useCategories();
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
    for (const id of deleteTarget.ids) deleteCategory(id);
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
        data={categories}
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

"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import type { ColumnDef } from "@tanstack/react-table";
import { Box, MoreHorizontal, Star } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { DataTable } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
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
import { type ProductRow, useProducts } from "@/store/products-context";

import { ProductModal } from "./product-modal";

export type { ProductRow };

function buildColumns(
  onDelete: (id: string) => void,
  onEdit: (id: string) => void,
  onView: (id: string) => void,
): ColumnDef<ProductRow>[] {
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
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.images?.[0] ? (
            // biome-ignore lint/performance/noImgElement: base64 preview
            <img
              src={row.original.images[0]}
              alt={row.original.name}
              className="size-10 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs">
              {row.original.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="font-medium leading-none">{row.original.name}</span>
            <span className="text-muted-foreground text-xs">{row.original.category}</span>
          </div>
        </div>
      ),
      filterFn: (row, _id, value: string) => row.original.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      accessorKey: "inventory",
      header: "Inventory",
      cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.inventory} in stock</span>,
    },
    {
      accessorKey: "color",
      header: "Color",
      filterFn: (row, _id, value) => row.original.color === value,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.price}</span>,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm tabular-nums">{row.original.rating.toFixed(1)}</span>
          <span className="text-muted-foreground text-xs">({row.original.votes} Votes)</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button aria-label="Product actions" size="icon-sm" variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onView(row.original.id)}>View product</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original.id)}>Edit product</DropdownMenuItem>
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

export function ProductsTable() {
  const router = useRouter();
  const { products, deleteProduct, bulkDeleteProducts } = useProducts();
  const [selectedProduct, setSelectedProduct] = React.useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ ids: string[]; label: string } | null>(null);
  const [clearTrigger, setClearTrigger] = React.useState(0);

  function handleDelete(id: string) {
    const name = products.find((p) => p.id === id)?.name ?? "product";
    setDeleteTarget({ ids: [id], label: `"${name}"` });
  }

  function handleDeleteSelected(ids: string[]) {
    setDeleteTarget({ ids, label: `${ids.length} product${ids.length > 1 ? "s" : ""}` });
  }

  function confirmDeletion() {
    if (!deleteTarget) return;
    if (deleteTarget.ids.length === 1) {
      deleteProduct(deleteTarget.ids[0]);
    } else {
      bulkDeleteProducts(deleteTarget.ids);
    }
    toast.success(`${deleteTarget.ids.length > 1 ? `${deleteTarget.ids.length} products` : "Product"} deleted`);
    setClearTrigger((n) => n + 1);
    setDeleteTarget(null);
  }

  // Stable ref so columns don't rebuild on every products change
  const handleDeleteRef = React.useRef(handleDelete);
  handleDeleteRef.current = handleDelete;

  const handleViewRef = React.useRef((id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) setSelectedProduct(product);
  });
  handleViewRef.current = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) setSelectedProduct(product);
  };

  const handleEditRef = React.useRef((id: string) => router.push(`/dashboard/products/edit/${id}`));

  const columns = React.useMemo(
    () =>
      buildColumns(
        (id) => handleDeleteRef.current(id),
        (id) => handleEditRef.current(id),
        (id) => handleViewRef.current(id),
      ),
    [],
  );

  return (
    <>
      <DataTable
        data={products}
        columns={columns}
        searchColumn="name"
        searchPlaceholder="Search products..."
        filterOptions={["Black", "White", "Blue", "Grey", "Navy", "Beige", "Green", "Pink"]}
        filterColumn="color"
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState icon={Box} title="No products yet" description="Add your first product to get started." />
        }
        onRowClick={setSelectedProduct}
        onDeleteSelected={handleDeleteSelected}
        clearSelectionTrigger={clearTrigger}
      />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        label={deleteTarget?.label ?? ""}
        onConfirm={confirmDeletion}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

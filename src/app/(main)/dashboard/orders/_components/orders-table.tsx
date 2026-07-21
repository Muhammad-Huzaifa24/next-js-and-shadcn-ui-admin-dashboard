"use client";

import * as React from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { MoreHorizontal, ShoppingCart } from "lucide-react";
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
import { type OrderRow, useOrders } from "@/store/orders-context";

import { OrderModal } from "./order-modal";

export type { OrderRow };

export function PaymentBadge({ status }: { status: OrderRow["payment"] }) {
  if (status === "Paid")
    return (
      <Badge
        className="border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300"
        variant="outline"
      >
        <span className="size-1.5 rounded-full bg-current" />
        Paid
      </Badge>
    );
  if (status === "Refunded")
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        Refunded
      </Badge>
    );
  return (
    <Badge
      className="border-yellow-700/25 text-yellow-700 dark:border-yellow-300/25 dark:text-yellow-300"
      variant="outline"
    >
      <span className="size-1.5 rounded-full bg-current" />
      Pending
    </Badge>
  );
}

export function OrderStatusBadge({ status }: { status: OrderRow["status"] }) {
  const map: Record<OrderRow["status"], string> = {
    Ready: "border-orange-600/25 text-orange-600 dark:border-orange-400/25 dark:text-orange-400",
    Shipped: "border-blue-600/25 text-blue-600 dark:border-blue-400/25 dark:text-blue-400",
    Delivered: "border-green-700/25 text-green-700 dark:border-green-300/25 dark:text-green-300",
    Cancelled: "",
  };
  if (status === "Cancelled")
    return (
      <Badge variant="destructive">
        <span className="size-1.5 rounded-full bg-current" />
        {status}
      </Badge>
    );
  return (
    <Badge className={map[status]} variant="outline">
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

function buildColumns(onDelete: (id: string) => void): ColumnDef<OrderRow>[] {
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
      accessorKey: "id",
      header: "Order",
      cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.id}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{format(parseISO(row.original.date), "MMM d, h:mm a")}</span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "payment",
      header: "Payment Status",
      cell: ({ row }) => <PaymentBadge status={row.original.payment} />,
      filterFn: (row, _id, value) => row.original.payment === value,
    },
    {
      accessorKey: "status",
      header: "Order Status",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="tabular-nums">{row.original.total}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button aria-label="Order actions" size="icon-sm" variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>View order</DropdownMenuItem>
                <DropdownMenuItem>Edit order</DropdownMenuItem>
                <DropdownMenuItem>Contact customer</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(row.original.id)}
                >
                  Delete order
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

export function OrdersTable() {
  const { orders, deleteOrder, bulkDeleteOrders } = useOrders();
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ ids: string[]; label: string } | null>(null);
  const [clearTrigger, setClearTrigger] = React.useState(0);

  function handleDelete(id: string) {
    setDeleteTarget({ ids: [id], label: `order ${id}` });
  }

  function handleDeleteSelected(ids: string[]) {
    setDeleteTarget({ ids, label: `${ids.length} order${ids.length > 1 ? "s" : ""}` });
  }

  function confirmDeletion() {
    if (!deleteTarget) return;
    if (deleteTarget.ids.length === 1) {
      deleteOrder(deleteTarget.ids[0]);
    } else {
      bulkDeleteOrders(deleteTarget.ids);
    }
    toast.success(`${deleteTarget.ids.length > 1 ? `${deleteTarget.ids.length} orders` : "Order"} deleted`);
    setClearTrigger((n) => n + 1);
    setDeleteTarget(null);
  }

  const handleDeleteRef = React.useRef(handleDelete);
  handleDeleteRef.current = handleDelete;

  const columns = React.useMemo(() => buildColumns((id) => handleDeleteRef.current(id)), []);

  return (
    <>
      <DataTable
        data={orders}
        columns={columns}
        searchColumn="customer"
        searchPlaceholder="Search customers..."
        filterOptions={["Paid", "Pending", "Refunded"]}
        filterColumn="payment"
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="Orders placed by customers will appear here."
          />
        }
        onRowClick={setSelectedOrder}
        onDeleteSelected={handleDeleteSelected}
        clearSelectionTrigger={clearTrigger}
      />
      <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        label={deleteTarget?.label ?? ""}
        onConfirm={confirmDeletion}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

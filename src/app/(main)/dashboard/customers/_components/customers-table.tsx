"use client";
"use no memo";

import * as React from "react";

import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
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
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type CustomerRow, useCustomers } from "@/store/customers-context";

export type { CustomerRow };

const segments: { value: string; label: string }[] = [
  { value: "all", label: "All Customers" },
  { value: "new", label: "New Customers" },
  { value: "europe", label: "From Europe" },
  { value: "returning", label: "Returning Customers" },
];

function buildColumns(onDelete: (id: string) => void): ColumnDef<CustomerRow>[] {
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
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
            {row.original.name[0].toUpperCase()}
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
      filterFn: (row, _id, value: string) => row.original.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.location}</span>,
    },
    {
      accessorKey: "orders",
      header: "Orders",
      cell: ({ row }) => <span className="tabular-nums">{row.original.orders}</span>,
    },
    {
      accessorKey: "spent",
      header: "Spent",
      cell: ({ row }) => <span className="font-medium text-primary tabular-nums">{row.original.spent}</span>,
    },
    {
      accessorKey: "segment",
      header: () => null,
      cell: () => null,
      filterFn: (row, _id, value: string) => value === "all" || row.original.segment === value,
      enableHiding: true,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Customer actions" size="icon-sm" variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>View profile</DropdownMenuItem>
                <DropdownMenuItem>View orders</DropdownMenuItem>
                <DropdownMenuItem>Send email</DropdownMenuItem>
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

function preventNav(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
}

export function CustomersTable() {
  const { customers, deleteCustomer } = useCustomers();
  const [activeSegment, setActiveSegment] = React.useState("all");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [deleteTarget, setDeleteTarget] = React.useState<{ ids: string[]; label: string } | null>(null);

  function handleDelete(id: string) {
    const name = customers.find((c) => c.id === id)?.name ?? "customer";
    setDeleteTarget({ ids: [id], label: `"${name}"` });
  }

  function handleDeleteSelected() {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id);
    setDeleteTarget({ ids, label: `${ids.length} customer${ids.length > 1 ? "s" : ""}` });
  }

  function confirmDeletion() {
    if (!deleteTarget) return;
    for (const id of deleteTarget.ids) deleteCustomer(id);
    if (deleteTarget.ids.length > 1) setRowSelection({});
    toast.success(`${deleteTarget.ids.length > 1 ? `${deleteTarget.ids.length} customers` : "Customer"} deleted`);
    setDeleteTarget(null);
  }

  const handleDeleteRef = React.useRef(handleDelete);
  handleDeleteRef.current = handleDelete;

  const columns = React.useMemo(() => buildColumns((id) => handleDeleteRef.current(id)), []);

  const table = useReactTable({
    data: customers,
    columns,
    state: { rowSelection, sorting, columnFilters, pagination },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleSegment(seg: string) {
    setActiveSegment(seg);
    table.getColumn("segment")?.setFilterValue(seg);
    table.setPageIndex(0);
  }

  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount();
  const pageNumbers = React.useMemo(() => {
    if (pageCount <= 3) return Array.from({ length: pageCount }, (_, i) => i + 1);
    if (currentPage <= 2) return [1, 2, 3];
    if (currentPage >= pageCount - 1) return [pageCount - 2, pageCount - 1, pageCount];
    return [currentPage - 1, currentPage, currentPage + 1];
  }, [currentPage, pageCount]);

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <>
      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-card">
        <div className="flex gap-1 overflow-x-auto border-b px-4 pt-3 pb-0">
          {segments.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleSegment(value)}
              className={cn(
                "shrink-0 cursor-pointer border-b-2 px-1 pb-2.5 text-sm transition-colors",
                activeSegment === value
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-56 pl-8"
              placeholder="Search customers..."
              value={String(table.getColumn("name")?.getFilterValue() ?? "")}
              onChange={(e) => {
                table.getColumn("name")?.setFilterValue(e.target.value);
                table.setPageIndex(0);
              }}
            />
          </div>
          <div className="flex items-center gap-1">
            <Button aria-label="Edit selected" size="icon-sm" variant="outline" disabled={selectedCount === 0}>
              <Pencil className="size-3.5" />
            </Button>
            <Button
              aria-label="Delete selected"
              size="icon-sm"
              variant="outline"
              disabled={selectedCount === 0}
              onClick={handleDeleteSelected}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-muted-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} colSpan={h.colSpan}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-muted/30">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="border-0 p-0">
                    <EmptyState
                      icon={Users}
                      title="No customers yet"
                      description="Customers will appear here once added."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
            <p className="text-muted-foreground text-sm">
              {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} customers
            </p>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    className={cn(!table.getCanPreviousPage() && "pointer-events-none opacity-50")}
                    href="#"
                    onClick={(e) => {
                      preventNav(e);
                      table.previousPage();
                    }}
                  />
                </PaginationItem>
                {pageNumbers[0] > 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {pageNumbers.map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink
                      href="#"
                      isActive={table.getState().pagination.pageIndex === n - 1}
                      onClick={(e) => {
                        preventNav(e);
                        table.setPageIndex(n - 1);
                      }}
                    >
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {pageNumbers[pageNumbers.length - 1] < pageCount && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    className={cn(!table.getCanNextPage() && "pointer-events-none opacity-50")}
                    href="#"
                    onClick={(e) => {
                      preventNav(e);
                      table.nextPage();
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        label={deleteTarget?.label ?? ""}
        onConfirm={confirmDeletion}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

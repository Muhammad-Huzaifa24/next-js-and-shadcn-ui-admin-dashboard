"use client";
"use no memo";

import * as React from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchColumn?: string;
  searchPlaceholder?: string;
  filterOptions?: string[];
  filterColumn?: string;
  tabs?: React.ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  getRowId?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  onDeleteSelected?: (ids: string[]) => void;
  clearSelectionTrigger?: number;
}

function preventNav(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
}

export function DataTable<TData>({
  data,
  columns,
  searchColumn,
  searchPlaceholder = "Search...",
  filterOptions,
  filterColumn,
  tabs,
  pageSize = 10,
  emptyMessage = "No results found.",
  emptyState,
  getRowId,
  onRowClick,
  onDeleteSelected,
  clearSelectionTrigger,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  React.useEffect(() => {
    if (clearSelectionTrigger !== undefined) setRowSelection({});
  }, [clearSelectionTrigger]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, sorting, columnFilters, pagination },
    getRowId,
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
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border bg-card">
      {tabs && <div className="border-b px-4 pt-3">{tabs}</div>}

      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2">
          {filterOptions && filterColumn && (
            <Select
              onValueChange={(val) => {
                table.getColumn(filterColumn)?.setFilterValue(val === "all" ? undefined : val);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-32" size="default">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  {filterOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          {searchColumn && (
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-56 pl-8"
                placeholder={searchPlaceholder}
                value={String(table.getColumn(searchColumn)?.getFilterValue() ?? "")}
                onChange={(e) => {
                  table.getColumn(searchColumn)?.setFilterValue(e.target.value);
                  table.setPageIndex(0);
                }}
              />
            </div>
          )}
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
            onClick={() => {
              if (!onDeleteSelected) return;
              const ids = table.getSelectedRowModel().rows.map((r) => r.id);
              onDeleteSelected(ids);
            }}
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
                {hg.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-muted/30">
            {table.getRowModel().rows.length
              ? table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={onRowClick ? "cursor-pointer" : undefined}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
            {!table.getRowModel().rows.length && emptyState && (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
            {!table.getRowModel().rows.length && !emptyState && (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={columns.length}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-4 border-t px-4 py-3">
          <p className="text-muted-foreground text-sm">
            {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} rows
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
  );
}

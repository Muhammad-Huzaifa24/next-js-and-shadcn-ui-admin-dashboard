"use client";

import * as React from "react";

import { ordersApi } from "@/lib/api";

export type OrderRow = {
  id: string;
  date: string;
  customer: string;
  payment: "Paid" | "Pending" | "Refunded";
  status: "Ready" | "Shipped" | "Delivered" | "Cancelled";
  total: string;
};

interface OrdersContextValue {
  orders: OrderRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addOrder: (order: Omit<OrderRow, "id">) => Promise<void>;
  updateOrder: (id: string, patch: Partial<OrderRow>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  bulkDeleteOrders: (ids: string[]) => Promise<void>;
}

const OrdersContext = React.createContext<OrdersContextValue | null>(null);

function mapOrder(raw: unknown): OrderRow {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r._id ?? r.id ?? ""),
    date: r.date ? new Date(r.date as string).toISOString() : new Date().toISOString(),
    customer: String(r.customer ?? ""),
    payment: (r.payment as OrderRow["payment"]) ?? "Pending",
    status: (r.status as OrderRow["status"]) ?? "Ready",
    total: String(r.total ?? "0"),
  };
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.list({ limit: "200" });
      setOrders((res.data.orders as unknown[]).map(mapOrder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // biome-ignore lint/nursery/noFloatingPromises: intentional fire-and-forget on mount
  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addOrder(data: Omit<OrderRow, "id">) {
    const res = await ordersApi.create(data);
    setOrders((prev) => [mapOrder(res.data.order), ...prev]);
  }

  async function updateOrder(id: string, patch: Partial<OrderRow>) {
    const res = await ordersApi.update(id, patch);
    setOrders((prev) => prev.map((o) => (o.id === id ? mapOrder(res.data.order) : o)));
  }

  async function deleteOrder(id: string) {
    await ordersApi.remove(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  async function bulkDeleteOrders(ids: string[]) {
    await ordersApi.bulkDelete(ids);
    const set = new Set(ids);
    setOrders((prev) => prev.filter((o) => !set.has(o.id)));
  }

  return (
    <OrdersContext value={{ orders, loading, error, refresh, addOrder, updateOrder, deleteOrder, bulkDeleteOrders }}>
      {children}
    </OrdersContext>
  );
}

export function useOrders(): OrdersContextValue {
  const ctx = React.use(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

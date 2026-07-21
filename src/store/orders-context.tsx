"use client";

import * as React from "react";

import { storageGet, storageSet } from "./storage";
import { STORAGE_KEYS } from "./storage-keys";

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
  addOrder: (order: Omit<OrderRow, "id">) => void;
  updateOrder: (id: string, patch: Partial<OrderRow>) => void;
  deleteOrder: (id: string) => void;
  bulkDeleteOrders: (ids: string[]) => void;
}

const OrdersContext = React.createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = React.useState<OrderRow[]>(() => {
    return storageGet<OrderRow[]>(STORAGE_KEYS.ORDERS) ?? [];
  });

  function persist(next: OrderRow[]) {
    setOrders(next);
    storageSet(STORAGE_KEYS.ORDERS, next);
  }

  function addOrder(data: Omit<OrderRow, "id">) {
    persist([...orders, { ...data, id: `#${Date.now()}` }]);
  }

  function updateOrder(id: string, patch: Partial<OrderRow>) {
    persist(orders.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function deleteOrder(id: string) {
    persist(orders.filter((o) => o.id !== id));
  }

  function bulkDeleteOrders(ids: string[]) {
    const set = new Set(ids);
    persist(orders.filter((o) => !set.has(o.id)));
  }

  return (
    <OrdersContext value={{ orders, addOrder, updateOrder, deleteOrder, bulkDeleteOrders }}>{children}</OrdersContext>
  );
}

export function useOrders(): OrdersContextValue {
  const ctx = React.use(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}

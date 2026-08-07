"use client";

import * as React from "react";

import { customersApi } from "@/lib/api";

export type Segment = "all" | "new" | "europe" | "returning";

export type CustomerRow = {
  id: string;
  name: string;
  location: string;
  orders: number;
  spent: string;
  segment: Segment;
};

interface CustomersContextValue {
  customers: CustomerRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCustomer: (c: Omit<CustomerRow, "id">) => Promise<void>;
  updateCustomer: (id: string, patch: Partial<CustomerRow>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  bulkDeleteCustomers: (ids: string[]) => Promise<void>;
}

const CustomersContext = React.createContext<CustomersContextValue | null>(null);

function mapCustomer(raw: unknown): CustomerRow {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r._id ?? r.id ?? ""),
    name: String(r.name ?? ""),
    location: String(r.location ?? ""),
    orders: Number(r.orders ?? 0),
    spent: String(r.spent ?? "0"),
    segment: (r.segment as Segment | undefined) ?? "new",
  };
}

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = React.useState<CustomerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customersApi.list();
      setCustomers((res.data.customers as unknown[]).map(mapCustomer));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  async function addCustomer(data: Omit<CustomerRow, "id">) {
    const res = await customersApi.create(data);
    setCustomers((prev) => [...prev, mapCustomer(res.data.customer)]);
  }

  async function updateCustomer(id: string, patch: Partial<CustomerRow>) {
    const res = await customersApi.update(id, patch);
    setCustomers((prev) => prev.map((c) => (c.id === id ? mapCustomer(res.data.customer) : c)));
  }

  async function deleteCustomer(id: string) {
    await customersApi.remove(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  async function bulkDeleteCustomers(ids: string[]) {
    await customersApi.bulkDelete(ids);
    const set = new Set(ids);
    setCustomers((prev) => prev.filter((c) => !set.has(c.id)));
  }

  return (
    <CustomersContext
      value={{ customers, loading, error, refresh, addCustomer, updateCustomer, deleteCustomer, bulkDeleteCustomers }}
    >
      {children}
    </CustomersContext>
  );
}

export function useCustomers(): CustomersContextValue {
  const ctx = React.use(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider");
  return ctx;
}

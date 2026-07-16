"use client";

import * as React from "react";

import { storageGet, storageSet } from "./storage";
import { STORAGE_KEYS } from "./storage-keys";

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
  addCustomer: (c: Omit<CustomerRow, "id">) => void;
  updateCustomer: (id: string, patch: Partial<CustomerRow>) => void;
  deleteCustomer: (id: string) => void;
}

const CustomersContext = React.createContext<CustomersContextValue | null>(null);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = React.useState<CustomerRow[]>(() => {
    return storageGet<CustomerRow[]>(STORAGE_KEYS.CUSTOMERS) ?? [];
  });

  function persist(next: CustomerRow[]) {
    setCustomers(next);
    storageSet(STORAGE_KEYS.CUSTOMERS, next);
  }

  function addCustomer(data: Omit<CustomerRow, "id">) {
    persist([...customers, { ...data, id: `c${Date.now()}` }]);
  }

  function updateCustomer(id: string, patch: Partial<CustomerRow>) {
    persist(customers.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function deleteCustomer(id: string) {
    persist(customers.filter((c) => c.id !== id));
  }

  return (
    <CustomersContext value={{ customers, addCustomer, updateCustomer, deleteCustomer }}>{children}</CustomersContext>
  );
}

export function useCustomers(): CustomersContextValue {
  const ctx = React.use(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider");
  return ctx;
}

"use client";

import type { ReactNode } from "react";

import { CategoriesProvider } from "./categories-context";
import { CustomersProvider } from "./customers-context";
import { OrdersProvider } from "./orders-context";
import { ProductsProvider } from "./products-context";

/**
 * Nests all four API-backed context providers.
 * Each provider fetches its data independently on mount — no localStorage.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <ProductsProvider>
      <CategoriesProvider>
        <OrdersProvider>
          <CustomersProvider>{children}</CustomersProvider>
        </OrdersProvider>
      </CategoriesProvider>
    </ProductsProvider>
  );
}

"use client";

import { CategoriesProvider } from "./categories-context";
import { CustomersProvider } from "./customers-context";
import { OrdersProvider } from "./orders-context";
import { ProductsProvider } from "./products-context";

export function StoreProvider({ children }: { children: React.ReactNode }) {
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

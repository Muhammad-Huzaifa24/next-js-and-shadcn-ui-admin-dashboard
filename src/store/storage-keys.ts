/**
 * All localStorage keys used by the app.
 *
 * Entity key map
 * ─────────────────────────────────────────
 * token          → auth token
 * ec_products    → ProductRow[]
 * ec_categories  → CategoryItem[]
 * ec_orders      → OrderRow[]
 * ec_customers   → CustomerRow[]
 * ─────────────────────────────────────────
 */

export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  PRODUCTS: "ec_products",
  CATEGORIES: "ec_categories",
  ORDERS: "ec_orders",
  CUSTOMERS: "ec_customers",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

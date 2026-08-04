/**
 * Shared API client
 *
 * Every call goes through apiFetch which:
 *  - Reads the JWT from localStorage and sends it as Authorization: Bearer <token>
 *  - Also sends credentials:include so the httpOnly cookie works in browsers
 *  - Sets Content-Type / Accept headers on JSON requests
 *  - On 401, attempts a silent token refresh once, then retries the original request
 *  - On refresh failure, clears the token and redirects to /login
 *  - Throws ApiError with the server's message on non-2xx responses
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Token helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = "studio_access_token";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function writeToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Silent token refresh ─────────────────────────────────────────────────────

// Deduplicate concurrent refresh calls — only one in-flight at a time
let refreshPromise: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
  if (await refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include", // sends the httpOnly refresh_token cookie
      });

      if (!res.ok) return null;

      const data = await res.json();
      const newToken = (data?.data?.accessToken as string) ?? null;
      if (newToken) writeToken(newToken);
      return newToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function doFetch(path: string, options: FetchOptions, token: string | null) {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  let serialisedBody: BodyInit | undefined;
  if (isFormData) {
    serialisedBody = body;
  } else if (body !== undefined) {
    serialisedBody = JSON.stringify(body);
  }

  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: serialisedBody,
    ...rest,
  });
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  // First attempt with current token
  const token = readToken();
  let res = await doFetch(path, options, token);

  // On 401, try a silent refresh and retry once
  if (res.status === 401) {
    const newToken = await silentRefresh();

    if (newToken) {
      // Retry with the fresh token
      res = await doFetch(path, options, newToken);
    } else {
      // Refresh failed — session is dead, send user to login
      clearToken();
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
      throw new ApiError("Session expired. Please log in again.", 401);
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = (data?.message as string) ?? message;
    } catch {
      // non-JSON error body — keep default
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ─── Pagination meta ──────────────────────────────────────────────────────────

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Entity API helpers ───────────────────────────────────────────────────────

// Categories
export const categoriesApi = {
  list: () => apiFetch<{ success: boolean; data: { categories: unknown[] } }>("/api/v1/categories"),

  /** Create with JSON body (no image) */
  create: (body: unknown) =>
    apiFetch<{ success: boolean; data: { category: unknown } }>("/api/v1/categories", {
      method: "POST",
      body,
    }),

  /** Create with FormData — image file uploaded as multipart */
  createWithForm: (form: FormData) =>
    apiFetch<{ success: boolean; data: { category: unknown } }>("/api/v1/categories", {
      method: "POST",
      body: form,
    }),

  /** Update with JSON body (no image change) */
  update: (id: string, body: unknown) =>
    apiFetch<{ success: boolean; data: { category: unknown } }>(`/api/v1/categories/${id}`, {
      method: "PUT",
      body,
    }),

  /** Update with FormData — image file uploaded as multipart */
  updateWithForm: (id: string, form: FormData) =>
    apiFetch<{ success: boolean; data: { category: unknown } }>(`/api/v1/categories/${id}`, {
      method: "PUT",
      body: form,
    }),

  remove: (id: string) => apiFetch(`/api/v1/categories/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) => apiFetch("/api/v1/categories/bulk-delete", { method: "POST", body: { ids } }),
};

// Products
export const productsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch<{ success: boolean; data: { products: unknown[]; pagination: Pagination } }>(
      `/api/v1/products${qs}`,
    );
  },
  create: (body: unknown) =>
    apiFetch<{ success: boolean; data: { product: unknown } }>("/api/v1/products", {
      method: "POST",
      body,
    }),
  update: (id: string, body: unknown) =>
    apiFetch<{ success: boolean; data: { product: unknown } }>(`/api/v1/products/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: string) => apiFetch(`/api/v1/products/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) => apiFetch("/api/v1/products/bulk-delete", { method: "POST", body: { ids } }),
};

// Orders
export const ordersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return apiFetch<{ success: boolean; data: { orders: unknown[]; pagination: Pagination } }>(`/api/v1/orders${qs}`);
  },
  create: (body: unknown) =>
    apiFetch<{ success: boolean; data: { order: unknown } }>("/api/v1/orders", {
      method: "POST",
      body,
    }),
  update: (id: string, body: unknown) =>
    apiFetch<{ success: boolean; data: { order: unknown } }>(`/api/v1/orders/${id}`, {
      method: "PUT",
      body,
    }),
  patchStatus: (id: string, status: string) =>
    apiFetch<{ success: boolean; data: { order: unknown } }>(`/api/v1/orders/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),
  remove: (id: string) => apiFetch(`/api/v1/orders/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) => apiFetch("/api/v1/orders/bulk-delete", { method: "POST", body: { ids } }),
};

// Customers
export const customersApi = {
  list: () => apiFetch<{ success: boolean; data: { customers: unknown[] } }>("/api/v1/customers"),
  create: (body: unknown) =>
    apiFetch<{ success: boolean; data: { customer: unknown } }>("/api/v1/customers", {
      method: "POST",
      body,
    }),
  update: (id: string, body: unknown) =>
    apiFetch<{ success: boolean; data: { customer: unknown } }>(`/api/v1/customers/${id}`, {
      method: "PUT",
      body,
    }),
  remove: (id: string) => apiFetch(`/api/v1/customers/${id}`, { method: "DELETE" }),
  bulkDelete: (ids: string[]) => apiFetch("/api/v1/customers/bulk-delete", { method: "POST", body: { ids } }),
};

// Dashboard
export const dashboardApi = {
  stats: () =>
    apiFetch<{
      success: boolean;
      data: {
        totalRevenue: number;
        totalOrders: number;
        pendingOrders: number;
        totalProducts: number;
        lowStockProducts: number;
        totalCategories: number;
        totalCustomers: number;
        newCustomers: number;
      };
    }>("/api/v1/dashboard/stats"),

  revenueOverview: (range: "3m" | "6m" | "12m" = "12m") =>
    apiFetch<{
      success: boolean;
      data: { overview: { month: string; revenue: number; profit: number }[] };
    }>(`/api/v1/dashboard/revenue-overview?range=${range}`),

  recentOrders: (limit = 5) =>
    apiFetch<{
      success: boolean;
      data: {
        orders: {
          id: string;
          date: string;
          customer: string;
          payment: "Paid" | "Pending" | "Refunded";
          total: string;
          items: string;
          fulfillment: "Fulfilled" | "Unfulfilled" | "Returned";
        }[];
      };
    }>(`/api/v1/dashboard/recent-orders?limit=${limit}`),
};

// Uploads
export const uploadsApi = {
  upload: (images: string[]) =>
    apiFetch<{ success: boolean; data: { urls: string[]; publicIds: string[] } }>("/api/v1/uploads", {
      method: "POST",
      body: { images },
    }),
  remove: (publicId: string) => apiFetch("/api/v1/uploads", { method: "DELETE", body: { publicId } }),
};

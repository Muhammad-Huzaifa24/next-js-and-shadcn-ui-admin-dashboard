/**
 * Auth helpers.
 *
 * Token strategy:
 *  - Server issues an httpOnly access_token cookie (read by the browser automatically)
 *  - We ALSO store the raw accessToken string in localStorage so:
 *      a) apiFetch can read it and send as Bearer header (works in any client)
 *      b) API testing tools (Postman, Thunder Client) can use it
 *  - A lightweight studio_session=1 cookie tracks login state for AuthGuard redirects
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const SESSION_MARKER = "studio_session";

/** Key used to store the raw JWT in localStorage */
export const TOKEN_KEY = "studio_access_token";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Session marker helpers (for AuthGuard redirect logic) ───────────────────

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  // Check both localStorage token AND session cookie — either is enough
  if (localStorage.getItem(TOKEN_KEY)) return true;
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not universally supported
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${SESSION_MARKER}=1`));
}

export function setSessionMarker(): void {
  const expires = new Date(Date.now() + 15 * 60 * 1000).toUTCString();
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not universally supported
  document.cookie = `${SESSION_MARKER}=1; path=/; expires=${expires}; SameSite=Strict`;
}

export function clearSessionMarker(): void {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not universally supported
  document.cookie = `${SESSION_MARKER}=; path=/; max-age=0; SameSite=Strict`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
};

// ─── API calls ────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<{ user: AuthUser; accessToken: string }> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Login failed");

  const { user, accessToken } = data.data as { user: AuthUser; accessToken: string };

  // Persist token in localStorage so apiFetch sends it as Bearer header
  saveToken(accessToken);
  setSessionMarker();

  return { user, accessToken };
}

export async function apiLogout(): Promise<void> {
  try {
    const token = getToken();
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } finally {
    // Always clear — even if the server request fails
    removeToken();
    clearSessionMarker();
  }
}

export async function apiMe(): Promise<AuthUser | null> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data.user as AuthUser;
  } catch {
    return null;
  }
}

// ─── Backward-compat aliases ──────────────────────────────────────────────────
export const clearAuthToken = clearSessionMarker;
export const setAuthToken = setSessionMarker;

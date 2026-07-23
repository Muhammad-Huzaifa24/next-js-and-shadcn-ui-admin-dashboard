/**
 * Auth helpers — replaces the hardcoded localStorage token with
 * real JWT-cookie-based auth backed by POST /api/v1/auth/login.
 *
 * The access token is stored in an httpOnly cookie by the server,
 * so the browser cannot read it from JS. We track login state with
 * a lightweight non-sensitive "session marker" cookie that IS readable
 * by JS so the client-side AuthGuard can redirect without a round-trip.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── Marker cookie (non-sensitive, JS-readable) ───────────────────────────────
// Written by the FE after a successful login response; cleared on logout.
// The actual auth is enforced by the httpOnly access_token cookie on every
// API call — this marker is only for client-side redirect decisions.
const SESSION_MARKER = "studio_session";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
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

// ─── User type (mirrors server safeUser response) ────────────────────────────
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
    credentials: "include", // receive httpOnly cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? "Login failed");
  }

  setSessionMarker();
  return data.data;
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    // Always clear marker even if the request fails
    clearSessionMarker();
  }
}

export async function apiMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data.user as AuthUser;
  } catch {
    return null;
  }
}

// ─── Legacy shims — kept so components not yet updated don't break ────────────
/** @deprecated use apiLogin() instead */
export function setAuthToken(): void {
  setSessionMarker();
}

/** @deprecated use apiLogout() instead */
export function clearAuthToken(): void {
  clearSessionMarker();
}

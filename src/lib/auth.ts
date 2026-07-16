export const AUTH_TOKEN_KEY = "token";
export const AUTH_TOKEN_VALUE = "allowed-login";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_TOKEN_KEY) === AUTH_TOKEN_VALUE;
}

export function setAuthToken(): void {
  localStorage.setItem(AUTH_TOKEN_KEY, AUTH_TOKEN_VALUE);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

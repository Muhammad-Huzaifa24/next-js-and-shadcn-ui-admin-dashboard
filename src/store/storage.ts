import type { StorageKey } from "./storage-keys";

/** Read a JSON value from localStorage, returning null on any failure. */
export function storageGet<T>(key: StorageKey): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Write a JSON value to localStorage. */
export function storageSet<T>(key: StorageKey, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private-mode — silently skip
  }
}

/** Remove a key from localStorage. */
export function storageRemove(key: StorageKey): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

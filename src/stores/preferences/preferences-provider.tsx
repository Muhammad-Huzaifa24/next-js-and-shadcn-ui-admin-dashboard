"use client";

import * as React from "react";

import { create, useStore } from "zustand";

import {
  PREFERENCE_DEFAULTS,
  PREFERENCE_KEYS,
  PREFERENCE_REGISTRY,
  type PreferenceKey,
  type PreferenceValueMap,
} from "@/lib/preferences/preferences-config";
import type { ResolvedThemeMode } from "@/lib/preferences/theme";

// ─── Store shape ─────────────────────────────────────────────────────────────

interface PreferencesState {
  values: PreferenceValueMap;
  resolvedThemeMode: ResolvedThemeMode;
  setPreference: <K extends PreferenceKey>(key: K, value: PreferenceValueMap[K]) => void;
  resetPreferences: () => void;
}

function createPreferencesStore(initialValues: PreferenceValueMap) {
  return create<PreferencesState>((set, get) => ({
    values: initialValues,
    resolvedThemeMode: resolveThemeMode(initialValues.theme_mode),

    setPreference: (key, value) => {
      const def = PREFERENCE_REGISTRY[key];

      // Apply to <html>
      document.documentElement.setAttribute(def.attribute, value);

      // Sync dark class for Tailwind dark: variant
      if (key === "theme_mode") {
        let resolved: string;
        if (value === "system") {
          resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        } else {
          resolved = value;
        }
        document.documentElement.classList.toggle("dark", resolved === "dark");
      }

      // Persist as cookie
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}`;

      const nextValues = { ...get().values, [key]: value };
      set({
        values: nextValues,
        resolvedThemeMode: resolveThemeMode(nextValues.theme_mode),
      });
    },

    resetPreferences: () => {
      for (const key of PREFERENCE_KEYS) {
        const def = PREFERENCE_REGISTRY[key];
        const defaultVal = def.defaultValue;
        document.documentElement.setAttribute(def.attribute, defaultVal);
        document.cookie = `${key}=${encodeURIComponent(defaultVal)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      }
      set({
        values: PREFERENCE_DEFAULTS,
        resolvedThemeMode: resolveThemeMode(PREFERENCE_DEFAULTS.theme_mode),
      });
    },
  }));
}

function resolveThemeMode(mode: string): ResolvedThemeMode {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode as ResolvedThemeMode;
}

// ─── Context ─────────────────────────────────────────────────────────────────

type PreferencesStore = ReturnType<typeof createPreferencesStore>;

const PreferencesContext = React.createContext<PreferencesStore | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

interface PreferencesStoreProviderProps {
  children: React.ReactNode;
  initialValues: PreferenceValueMap;
}

export function PreferencesStoreProvider({ children, initialValues }: PreferencesStoreProviderProps) {
  const storeRef = React.useRef<PreferencesStore>(null);
  if (!storeRef.current) {
    storeRef.current = createPreferencesStore(initialValues);
  }

  // Apply dark class on mount based on persisted preference
  React.useEffect(() => {
    const mode = initialValues.theme_mode;
    let resolved: string;
    if (mode === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      resolved = mode;
    }
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [initialValues.theme_mode]);

  return <PreferencesContext value={storeRef.current}>{children}</PreferencesContext>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePreferencesStore<T>(selector: (state: PreferencesState) => T): T {
  const store = React.use(PreferencesContext);
  if (!store) throw new Error("usePreferencesStore must be used within PreferencesStoreProvider");
  return useStore(store, selector);
}

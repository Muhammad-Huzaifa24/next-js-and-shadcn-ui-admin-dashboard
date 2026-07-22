import type { ReactNode } from "react";
import { Suspense } from "react";

import type { Metadata } from "next";

import { NavigationProgress } from "@/components/navigation-progress";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/config/app-config";
import { fontVars } from "@/lib/fonts/registry";
import { PREFERENCE_DEFAULTS, PREFERENCE_KEYS, PREFERENCE_REGISTRY } from "@/lib/preferences/preferences-config";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { theme_mode, theme_preset, content_layout, navbar_style, sidebar_variant, sidebar_collapsible, font } =
    PREFERENCE_DEFAULTS;

  const registry = Object.fromEntries(
    PREFERENCE_KEYS.map((key) => [
      key,
      {
        attribute: PREFERENCE_REGISTRY[key].attribute,
        defaultValue: PREFERENCE_REGISTRY[key].defaultValue,
        values: [...PREFERENCE_REGISTRY[key].values],
      },
    ]),
  );

  const themeScript = `(function(){try{var c=document.cookie.split(";").reduce(function(a,x){var p=x.trim().split("=");a[decodeURIComponent(p[0])]=decodeURIComponent(p[1]||"");return a},{});var r=${JSON.stringify(registry)};var h=document.documentElement;Object.keys(r).forEach(function(k){var d=r[k];var v=c[k]&&d.values.includes(c[k])?c[k]:d.defaultValue;h.setAttribute(d.attribute,v);});var m=c["theme_mode"]||"light";var resolved=m==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;h.classList.toggle("dark",resolved==="dark");}catch(e){}})();`;
  return (
    <html
      lang="en"
      data-theme-mode={theme_mode}
      data-theme-preset={theme_preset}
      data-content-layout={content_layout}
      data-navbar-style={navbar_style}
      data-sidebar-variant={sidebar_variant}
      data-sidebar-collapsible={sidebar_collapsible}
      data-font={font}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static anti-flicker script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${fontVars} min-h-screen antialiased`}>
        <TooltipProvider>
          <PreferencesStoreProvider initialValues={PREFERENCE_DEFAULTS}>
            <Suspense>
              <NavigationProgress />
            </Suspense>
            {children}
            <Toaster />
          </PreferencesStoreProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

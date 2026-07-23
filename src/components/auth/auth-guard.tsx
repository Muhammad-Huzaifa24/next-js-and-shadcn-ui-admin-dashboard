"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { isAuthenticated } from "@/lib/auth";

/**
 * Protects dashboard routes.
 *
 * Renders nothing until the component has mounted on the client — this
 * prevents the sidebar/dashboard layout from flashing briefly on the login
 * page when the session marker cookie is absent (SSR always returns false
 * for isAuthenticated, so we must wait for hydration before deciding).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  // Don't render anything until we've confirmed auth on the client.
  // This stops the sidebar from briefly appearing on the /login page.
  if (!mounted || !isAuthenticated()) return null;

  return <>{children}</>;
}

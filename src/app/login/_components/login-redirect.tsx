"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { isAuthenticated } from "@/lib/auth";

/**
 * Redirects already-authenticated users away from the login page.
 *
 * Renders a full-screen blank cover until the client has mounted and we know
 * whether the user is authenticated. This prevents the login page content from
 * flashing momentarily before the redirect fires.
 */
export function LoginRedirect() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      // Not authenticated — safe to show the login form
      setChecked(true);
    }
  }, [router]);

  // While we haven't confirmed auth state yet, show a plain blank screen
  // so neither the login form nor the dashboard sidebar bleeds through.
  if (!checked) {
    return <div className="fixed inset-0 z-50 bg-background" aria-hidden="true" />;
  }

  return null;
}

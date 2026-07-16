import { ShoppingBag } from "lucide-react";

import { APP_CONFIG } from "@/config/app-config";

import { LoginForm } from "./_components/login-form";
import { LoginRedirect } from "./_components/login-redirect";

export default function LoginPage() {
  return (
    <>
      <LoginRedirect />
      <main className="grid h-dvh lg:grid-cols-2">
        {/* Left panel — decorative, hidden on mobile */}
        <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-6" />
            <span className="font-semibold text-lg">{APP_CONFIG.name}</span>
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold text-2xl">Manage your store</h2>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Your all-in-one E-commerce admin panel. Track orders, manage products, and grow your business.
            </p>
          </div>
          <p className="text-primary-foreground/50 text-xs">{APP_CONFIG.copyright}</p>
        </div>

        {/* Right panel — login form */}
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-8">
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-2 lg:hidden">
              <ShoppingBag className="size-5 text-primary" />
              <span className="font-semibold">{APP_CONFIG.name}</span>
            </div>

            <div className="space-y-2 text-center">
              <h1 className="font-semibold text-2xl tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground text-sm">Sign in to your admin account</p>
            </div>

            <LoginForm />

            <p className="text-center text-muted-foreground text-xs">{APP_CONFIG.copyright}</p>
          </div>
        </div>
      </main>
    </>
  );
}

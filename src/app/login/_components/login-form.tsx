"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAuthToken } from "@/lib/auth";
import { storageRemove } from "@/store/storage";
import { STORAGE_KEYS } from "@/store/storage-keys";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setError("Invalid username or password.");
      return;
    }

    setLoading(true);
    setAuthToken();
    // Clear any stale seed data so only real user data persists
    storageRemove(STORAGE_KEYS.PRODUCTS);
    storageRemove(STORAGE_KEYS.CATEGORIES);
    storageRemove(STORAGE_KEYS.ORDERS);
    storageRemove(STORAGE_KEYS.CUSTOMERS);
    toast.success("Login successful", { description: `Welcome back, ${username}!` });
    router.replace("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="admin"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AuthUser, apiLogout, apiMe } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

// Fallback if the API hasn't loaded yet or fails
const fallbackUser: AuthUser = {
  id: "1",
  name: "Admin",
  email: "admin@studio.local",
  role: "administrator",
  lastLoginAt: null,
};

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>(fallbackUser);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiMe();
        if (data) setUser(data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    void fetchUser();
  }, []);

  async function handleLogout() {
    await apiLogout();
    router.replace("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer rounded-lg">
          <AvatarFallback className="rounded-lg text-xs">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm leading-none">{user.name}</span>
              <span className="text-muted-foreground text-xs capitalize">{user.role}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

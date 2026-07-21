"use client";

import type { ReactNode } from "react";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  back?: boolean;
}

export function PageHeader({ title, actions, back = true }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-1">
      {back && (
        <button
          type="button"
          onClick={() => router.back()}
          className="flex w-fit cursor-pointer items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </button>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl leading-none tracking-tight">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

interface PageHeaderActionProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
}

export function PageHeaderAction({ children, onClick, variant = "outline" }: PageHeaderActionProps) {
  return (
    <Button size="sm" variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}

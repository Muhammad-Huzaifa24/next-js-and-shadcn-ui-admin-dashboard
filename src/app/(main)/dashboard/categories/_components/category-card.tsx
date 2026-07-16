import Link from "next/link";

import { cn } from "@/lib/utils";
import type { CategoryItem } from "@/store/categories-context";

interface CategoryCardProps {
  category: CategoryItem;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/dashboard/categories/${category.id}`}
      className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={cn(
          "flex h-44 items-center justify-center font-bold text-4xl text-white/80 tracking-tight",
          category.color,
        )}
      >
        {category.initials}
      </div>
      <div className="absolute top-3 right-3 rounded-md bg-background/80 px-2 py-0.5 font-medium text-xs ring-1 ring-foreground/10 backdrop-blur-sm">
        {category.count} {category.unit}
      </div>
      <div className="px-4 py-3">
        <p className="font-medium leading-none">{category.name}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {category.count} {category.unit}
        </p>
      </div>
    </Link>
  );
}

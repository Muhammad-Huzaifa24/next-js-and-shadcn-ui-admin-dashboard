"use client";

import * as React from "react";

import { ArrowUpRight, Box, DollarSign, FolderOpen, ShoppingCart, Users } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi } from "@/lib/api";

type Stats = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  totalCustomers: number;
  newCustomers: number;
};

const EMPTY: Stats = {
  totalRevenue: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalProducts: 0,
  lowStockProducts: 0,
  totalCategories: 0,
  totalCustomers: 0,
  newCustomers: 0,
};

export function StatsStrip() {
  const [stats, setStats] = React.useState<Stats>(EMPTY);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    dashboardApi
      .stats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(EMPTY))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n.toLocaleString();
  const fmtMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cards = [
    {
      title: "Total Revenue",
      value: loading ? "—" : fmtMoney(stats.totalRevenue),
      icon: DollarSign,
      sub: loading ? "…" : `${fmt(stats.totalOrders)} orders`,
    },
    {
      title: "Total Orders",
      value: loading ? "—" : fmt(stats.totalOrders),
      icon: ShoppingCart,
      sub: loading ? "…" : `${fmt(stats.pendingOrders)} pending`,
    },
    {
      title: "Total Products",
      value: loading ? "—" : fmt(stats.totalProducts),
      icon: Box,
      sub: loading ? "…" : `${fmt(stats.lowStockProducts)} low stock`,
    },
    {
      title: "Total Categories",
      value: loading ? "—" : fmt(stats.totalCategories),
      icon: FolderOpen,
      sub: loading ? "…" : `${fmt(stats.totalCategories)} active`,
    },
    {
      title: "Total Customers",
      value: loading ? "—" : fmt(stats.totalCustomers),
      icon: Users,
      sub: loading ? "…" : `${fmt(stats.newCustomers)} new`,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:col-span-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isLast = index === cards.length - 1;
          return (
            <Card
              key={card.title}
              className={["h-full rounded-none border-0 ring-0", !isLast ? "border-b lg:border-r lg:border-b-0" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <CardHeader>
                <CardTitle className="font-normal text-muted-foreground text-sm">{card.title}</CardTitle>
                <CardDescription className="text-2xl text-foreground tabular-nums leading-none tracking-tight">
                  {card.value}
                </CardDescription>
                <CardAction className="grid size-7 place-items-center rounded-md bg-muted">
                  <Icon className="size-3.5 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpRight className="size-3.5 text-green-700 dark:text-green-300" />
                  <span className="text-muted-foreground">{card.sub}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

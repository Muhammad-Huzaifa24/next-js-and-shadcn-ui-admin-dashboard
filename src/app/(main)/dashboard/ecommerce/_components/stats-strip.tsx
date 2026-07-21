"use client";

import * as React from "react";

import { ArrowUpRight, Box, DollarSign, FolderOpen, ShoppingCart, Users } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/store/categories-context";
import { useCustomers } from "@/store/customers-context";
import { useOrders } from "@/store/orders-context";
import { useProducts } from "@/store/products-context";

export function StatsStrip() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { orders } = useOrders();
  const { customers } = useCustomers();

  // Defer to client to avoid SSR/client hydration mismatch (localStorage only on client)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalRevenue = mounted
    ? orders.reduce((sum, o) => {
        const n = parseFloat(o.total.replace(/[$,]/g, ""));
        return sum + (Number.isNaN(n) ? 0 : n);
      }, 0)
    : 0;

  const stats = [
    {
      title: "Total Revenue",
      value: mounted
        ? `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "$0.00",
      icon: DollarSign,
      sub: `${mounted ? orders.length : 0} orders`,
    },
    {
      title: "Total Orders",
      value: mounted ? orders.length.toLocaleString() : "0",
      icon: ShoppingCart,
      sub: `${mounted ? orders.filter((o) => o.status === "Ready").length : 0} pending`,
    },
    {
      title: "Total Products",
      value: mounted ? products.length.toLocaleString() : "0",
      icon: Box,
      sub: `${mounted ? products.filter((p) => p.inventory < 20).length : 0} low stock`,
    },
    {
      title: "Total Categories",
      value: mounted ? categories.length.toLocaleString() : "0",
      icon: FolderOpen,
      sub: `${mounted ? categories.length : 0} active`,
    },
    {
      title: "Total Customers",
      value: mounted ? customers.length.toLocaleString() : "0",
      icon: Users,
      sub: `${mounted ? customers.filter((c) => c.segment === "new").length : 0} new`,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:col-span-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isLast = index === stats.length - 1;

          return (
            <Card
              key={stat.title}
              className={["h-full rounded-none border-0 ring-0", !isLast ? "border-b lg:border-r lg:border-b-0" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <CardHeader>
                <CardTitle className="font-normal text-muted-foreground text-sm">{stat.title}</CardTitle>
                <CardDescription className="text-2xl text-foreground tabular-nums leading-none tracking-tight">
                  {stat.value}
                </CardDescription>
                <CardAction className="grid size-7 place-items-center rounded-md bg-muted">
                  <Icon className="size-3.5 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpRight className="size-3.5 text-green-700 dark:text-green-300" />
                  <span className="text-muted-foreground">{stat.sub}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

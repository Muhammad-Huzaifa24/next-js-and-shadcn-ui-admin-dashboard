import { connectDB } from "@/lib/db";

import Category from "../models/category";
import Customer from "../models/customer";
import Order from "../models/order";
import Product from "../models/product";

/**
 * Dashboard Service - Pure business logic extracted from Express dashboard controller
 * No Express/Next.js dependencies - only plain Node.js + Mongoose
 */

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCategories: number;
  totalCustomers: number;
  newCustomers: number;
}

export async function getStats(): Promise<DashboardStats> {
  await connectDB();

  // Helper expression: strip "$" and "," from a string field then cast to double
  // $literal is required to pass "$" as a plain string — bare "$" is treated
  // as a field-path reference by MongoDB and throws "not a valid FieldPath"
  const parseTotalExpr = (field: string) => ({
    $toDouble: {
      $replaceAll: {
        input: {
          $replaceAll: {
            input: `$${field}`,
            find: { $literal: "$" },
            replacement: "",
          },
        },
        find: ",",
        replacement: "",
      },
    },
  });

  const [revenueData, orderCounts, productStats, categoryCount, customerStats] = await Promise.all([
    Order.aggregate([
      { $project: { totalNum: parseTotalExpr("total") } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalNum" } } },
    ]),

    Order.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          pending: [{ $match: { status: "Ready" } }, { $count: "count" }],
        },
      },
    ]),

    Product.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          lowStock: [{ $match: { inventory: { $lt: 20 } } }, { $count: "count" }],
        },
      },
    ]),

    Category.countDocuments(),

    Customer.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          new: [{ $match: { segment: "new" } }, { $count: "count" }],
        },
      },
    ]),
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue ?? 0;
  const totalOrders = orderCounts[0].total[0]?.count ?? 0;
  const pendingOrders = orderCounts[0].pending[0]?.count ?? 0;
  const totalProducts = productStats[0].total[0]?.count ?? 0;
  const lowStockProducts = productStats[0].lowStock[0]?.count ?? 0;
  const totalCategories = categoryCount;
  const totalCustomers = customerStats[0].total[0]?.count ?? 0;
  const newCustomers = customerStats[0].new[0]?.count ?? 0;

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    totalCategories,
    totalCustomers,
    newCustomers,
  };
}

export interface RevenueOverviewItem {
  month: string;
  revenue: number;
  profit: number;
}

export async function getRevenueOverview(range: "3m" | "6m" | "12m" = "12m"): Promise<RevenueOverviewItem[]> {
  await connectDB();

  const RANGE_MAP = { "3m": 3, "6m": 6, "12m": 12 };
  const monthsBack = RANGE_MAP[range] ?? 12;

  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - monthsBack);

  const pipeline = [
    { $match: { date: { $gte: monthsAgo } } },
    {
      $project: {
        month: { $dateToString: { format: "%Y-%m", date: "$date" } },
        totalNum: {
          $toDouble: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: "$total",
                  find: { $literal: "$" },
                  replacement: "",
                },
              },
              find: ",",
              replacement: "",
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$month",
        revenue: { $sum: "$totalNum" },
      },
    },
    { $sort: { _id: 1 as const } },
  ] as any[];

  const data = await Order.aggregate(pipeline);

  // Transform to {month, revenue, profit}
  return data.map((d) => ({
    month: d._id,
    revenue: parseFloat(d.revenue.toFixed(2)),
    // Simplified profit estimate (26% margin)
    profit: parseFloat((d.revenue * 0.26).toFixed(2)),
  }));
}

export interface RecentOrder {
  id: string;
  date: string;
  customer: string;
  payment: string;
  total: string;
  items: string;
  fulfillment: string;
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  await connectDB();

  const maxLimit = Math.min(20, Math.max(1, limit));

  const orders = await Order.find().sort({ date: -1 }).limit(maxLimit).lean();

  // Map to RecentOrdersTable shape — add dummy `items` + `fulfillment` for now
  return orders.map((o) => ({
    id: o._id.toString(),
    date: o.date.toISOString(),
    customer: o.customer,
    payment: o.payment,
    total: o.total,
    // Placeholder fields — update when the Order model gets these fields
    items: "1 item",
    fulfillment: o.status === "Delivered" ? "Fulfilled" : "Unfulfilled",
  }));
}

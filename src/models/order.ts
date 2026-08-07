import mongoose from "mongoose";

import type { IOrder, OrderStatus, PaymentStatus } from "../types";

/**
 * Order model - mirrors BackEnd/src/models/Order.js exactly
 *
 * Mirrors OrderRow from src/store/orders-context.tsx
 *
 * OrderRow {
 *   id, date,       ← string (ISO date) in FE
 *   customer,       ← customer name string (not a reference)
 *   payment:  "Paid" | "Pending" | "Refunded"
 *   status:   "Ready" | "Shipped" | "Delivered" | "Cancelled"
 *   total:    string (e.g. "$100")
 * }
 */

const PAYMENT_ENUM: PaymentStatus[] = ["Paid", "Pending", "Refunded"];
const STATUS_ENUM: OrderStatus[] = ["Ready", "Shipped", "Delivered", "Cancelled"];

const orderSchema = new mongoose.Schema<IOrder>(
  {
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    customer: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    payment: {
      type: String,
      enum: {
        values: PAYMENT_ENUM,
        message: "Payment must be one of: Paid, Pending, Refunded",
      },
      default: "Pending",
    },
    status: {
      type: String,
      enum: {
        values: STATUS_ENUM,
        message: "Status must be one of: Ready, Shipped, Delivered, Cancelled",
      },
      default: "Ready",
      index: true,
    },
    // Stored as string to match FE (e.g. "$150.00")
    total: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

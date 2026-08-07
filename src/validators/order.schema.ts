import { z } from "zod";

/**
 * Order validation schemas — mirror BackEnd/src/validators/order.validator.js
 */

const baseOrderFields = {
  date: z.string().datetime().optional(),
  customer: z.string().min(1, "Customer name is required").max(200, "Customer name is too long"),
  payment: z.enum(["Paid", "Pending", "Refunded"]).optional().default("Pending"),
  status: z.enum(["Ready", "Shipped", "Delivered", "Cancelled"]).optional().default("Ready"),
  total: z.string().max(30).optional().default("0"),
};

export const createOrderSchema = z.object(baseOrderFields).strict();

export const updateOrderSchema = z.object(baseOrderFields).strict().partial();

export const patchStatusSchema = z.object({
  status: z.enum(["Ready", "Shipped", "Delivered", "Cancelled"]),
});

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "At least one order ID is required")
    .max(100, "Cannot delete more than 100 orders at once"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type PatchStatusInput = z.infer<typeof patchStatusSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

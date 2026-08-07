import { z } from "zod";

/**
 * Category validation schemas — mirror BackEnd/src/validators/category.validator.js
 */

const baseCategoryFields = {
  name: z.string().min(1, "Category name is required").max(100, "Category name must not exceed 100 characters"),
  count: z.coerce.number().int().min(0, "Count cannot be negative").optional().default(0),
  unit: z.string().max(50, "Unit is too long").optional().default(""),
  color: z.string().max(50, "Color is too long").optional().default(""),
  initials: z.string().max(10, "Initials must not exceed 10 characters").optional().default(""),
  image: z.string().optional().default(""),
  description: z.string().max(1000, "Description is too long").optional().default(""),
  visible: z.boolean().optional().default(true),
};

export const createCategorySchema = z.object(baseCategoryFields).strict();

export const updateCategorySchema = z.object(baseCategoryFields).strict().partial();

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "At least one category ID is required")
    .max(100, "Cannot delete more than 100 categories at once"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

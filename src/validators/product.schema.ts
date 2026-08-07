import { z } from "zod";

/**
 * Product validation schemas — mirror BackEnd/src/validators/product.validator.js
 */

const baseProductFields = {
  name: z.string().min(1, "Product name is required").max(200, "Product name must not exceed 200 characters"),
  description: z.string().max(5000, "Description is too long").optional().default(""),
  category: z.string().max(100, "Category name is too long").optional().default(""),
  inventory: z.coerce.number().int().min(0, "Inventory cannot be negative").optional().default(0),
  color: z.string().max(50, "Color is too long").optional().default(""),
  price: z.string().max(20).optional().default("0"),
  discountPrice: z.string().max(20).optional().default("0"),
  hasTax: z.boolean().optional().default(false),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .max(20, "Cannot have more than 20 images")
    .optional()
    .default([]),
  hasOptions: z.boolean().optional().default(false),
  options: z
    .array(
      z.object({
        type: z.string().max(100),
        values: z.array(z.string().max(100)),
      }),
    )
    .max(50, "Cannot have more than 50 options")
    .optional()
    .default([]),
  weight: z.string().max(50).optional().default(""),
  country: z.string().max(100).optional().default(""),
  isDigital: z.boolean().optional().default(false),
  tags: z.array(z.string().max(50)).max(50, "Cannot have more than 50 tags").optional().default([]),
  seoTitle: z.string().max(200, "SEO title must not exceed 200 characters").optional().default(""),
  seoDesc: z.string().max(500, "SEO description must not exceed 500 characters").optional().default(""),
  rating: z.coerce.number().min(0, "Rating cannot be below 0").max(5, "Rating cannot exceed 5").optional().default(0),
  votes: z.coerce.number().int().min(0, "Votes cannot be negative").optional().default(0),
};

export const createProductSchema = z.object(baseProductFields).strict();

export const updateProductSchema = z.object(baseProductFields).strict().partial();

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, "At least one product ID is required")
    .max(100, "Cannot delete more than 100 products at once"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

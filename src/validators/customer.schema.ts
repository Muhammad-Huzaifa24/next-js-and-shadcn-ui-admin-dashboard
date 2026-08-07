import { z } from 'zod';

/**
 * Customer validation schemas — mirror BackEnd/src/validators/customer.validator.js
 */

const baseCustomerFields = {
  name: z
    .string()
    .min(1, 'Customer name is required')
    .max(200, 'Customer name is too long'),
  location: z
    .string()
    .max(200, 'Location is too long')
    .optional()
    .default(''),
  orders: z
    .coerce
    .number()
    .int()
    .min(0, 'Orders count cannot be negative')
    .optional()
    .default(0),
  spent: z
    .string()
    .max(30)
    .optional()
    .default('0'),
  segment: z
    .enum(['all', 'new', 'europe', 'returning'])
    .optional()
    .default('new'),
  email: z
    .string()
    .email('Email must be valid')
    .max(254, 'Email is too long')
    .optional(),
};

export const createCustomerSchema = z.object(baseCustomerFields).strict();

export const updateCustomerSchema = z.object(baseCustomerFields).strict().partial();

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, 'At least one customer ID is required')
    .max(100, 'Cannot delete more than 100 customers at once'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;
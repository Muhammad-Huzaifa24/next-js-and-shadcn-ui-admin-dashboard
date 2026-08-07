import mongoose from 'mongoose';
import type { ICustomer, CustomerSegment } from '@/types';

/**
 * Customer model - mirrors BackEnd/src/models/Customer.js exactly
 * 
 * Mirrors CustomerRow from src/store/customers-context.tsx
 *
 * CustomerRow {
 *   id, name, location, orders, spent (string), segment
 * }
 *
 * Segment: "all" | "new" | "europe" | "returning"
 */

const SEGMENT_ENUM: CustomerSegment[] = ['all', 'new', 'europe', 'returning'];

const customerSchema = new mongoose.Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      // Security: do NOT log this field — treat as personal data
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    orders: {
      type: Number,
      default: 0,
      min: [0, 'Orders count cannot be negative'],
    },
    // String to match FE shape (e.g. "$1,200")
    spent: {
      type: String,
      default: '0',
    },
    segment: {
      type: String,
      enum: {
        values: SEGMENT_ENUM,
        message: 'Segment must be one of: all, new, europe, returning',
      },
      default: 'new',
    },
    // Optional — not shown in UI but used for server-side deduplication
    email: {
      type: String,
      unique: true,
      sparse: true,   // allows multiple documents with no email
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
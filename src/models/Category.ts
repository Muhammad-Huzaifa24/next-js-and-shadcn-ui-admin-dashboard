import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import type { ICategory } from '@/types';

/**
 * Category model - mirrors BackEnd/src/models/Category.js exactly
 * 
 * Mirrors CategoryItem from src/store/categories-context.tsx
 *
 * CategoryItem {
 *   id, name, count, unit, color, initials, image?
 * }
 */
const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Count cannot be negative'],
    },
    unit: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    initials: {
      type: String,
      trim: true,
      default: '',
    },
    // Stored as a URL string; frontend may send base64 — store as-is
    image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// ─── Sanitize text fields before every save (stored XSS guard) ───────────────
const STRIP_ALL = { allowedTags: [], allowedAttributes: {} };

categorySchema.pre('save', function () {
  if (this.isModified('name'))        this.name        = sanitizeHtml(this.name,        STRIP_ALL);
  if (this.isModified('unit'))        this.unit        = sanitizeHtml(this.unit,        STRIP_ALL);
  if (this.isModified('description')) this.description = sanitizeHtml(this.description, STRIP_ALL);
});

categorySchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  const update = this.getUpdate() as any;
  if (!update) return;

  const fields = ['name', 'unit', 'description'];
  for (const field of fields) {
    if (update[field])        update[field]        = sanitizeHtml(update[field],        STRIP_ALL);
    if (update.$set?.[field]) update.$set[field]   = sanitizeHtml(update.$set[field],  STRIP_ALL);
  }
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
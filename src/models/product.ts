import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";

import type { IProduct, ProductOption } from "../types";

/**
 * Product model - mirrors BackEnd/src/models/Product.js exactly
 *
 * Mirrors ProductRow from src/store/products-context.tsx
 *
 * ProductRow {
 *   id, name, description, category, inventory, color,
 *   price, discountPrice,       ← stored as strings ("$29.99") to match UI
 *   hasTax, images, hasOptions,
 *   options: [{ type, values }],
 *   weight, country, isDigital, tags,
 *   seoTitle, seoDesc, rating, votes
 * }
 */

const productOptionSchema = new mongoose.Schema<ProductOption>(
  {
    type: { type: String, trim: true, default: "" },
    values: [{ type: String, trim: true }],
  },
  { _id: false },
);

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Matches the category *name* string the UI stores (not an ObjectId ref)
    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    inventory: {
      type: Number,
      default: 0,
      min: [0, "Inventory cannot be negative"],
    },
    color: {
      type: String,
      default: "",
      trim: true,
    },
    // Strings to match FE shape — e.g. "$29.99" or "29.99"
    price: {
      type: String,
      default: "0",
    },
    discountPrice: {
      type: String,
      default: "0",
    },
    hasTax: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
    },
    hasOptions: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [productOptionSchema],
      default: [],
    },
    weight: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "",
      trim: true,
    },
    isDigital: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    seoTitle: {
      type: String,
      default: "",
    },
    seoDesc: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be below 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    votes: {
      type: Number,
      default: 0,
      min: [0, "Votes cannot be negative"],
    },
  },
  { timestamps: true },
);

// ─── Text index for search (name + description + tags) ───────────────────────
productSchema.index({ name: "text", description: "text", tags: "text" });

// ─── Sanitize XSS-prone fields before save ───────────────────────────────────
const STRIP_ALL = { allowedTags: [], allowedAttributes: {} };
const SANITIZE_FIELDS = ["description", "seoTitle", "seoDesc"];

// biome-ignore lint/suspicious/noExplicitAny: Mongoose pre-save hook requires dynamic field access
productSchema.pre("save", function () {
  for (const field of SANITIZE_FIELDS) {
    if (this.isModified(field) && (this as any)[field]) {
      (this as any)[field] = sanitizeHtml((this as any)[field], STRIP_ALL);
    }
  }
  // Sanitize each tag
  if (this.isModified("tags") && Array.isArray(this.tags)) {
    this.tags = this.tags.map((t) => sanitizeHtml(t, STRIP_ALL));
  }
});

// biome-ignore lint/suspicious/noExplicitAny: Mongoose getUpdate() returns dynamic update object
productSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function () {
  const update = this.getUpdate() as any;
  if (!update) return;

  for (const field of SANITIZE_FIELDS) {
    if (update[field]) update[field] = sanitizeHtml(update[field], STRIP_ALL);
    if (update.$set?.[field]) update.$set[field] = sanitizeHtml(update.$set[field], STRIP_ALL);
  }
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

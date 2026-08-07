import mongoose from "mongoose";

import { cloudinary } from "@/config/cloudinary";
import { connectDB } from "@/lib/db";
import { ServiceError } from "@/lib/service-error";
import Category from "@/models/category";

/**
 * Category Service - Pure business logic extracted from Express category controller
 * No Express/Next.js dependencies - only plain Node.js + Mongoose
 */

/**
 * Upload a file buffer to Cloudinary using the properly configured instance.
 */
async function uploadFileToCloudinary(file: File): Promise<string> {
  console.log("[uploadFileToCloudinary] Starting upload for file:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const publicId = `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  console.log("[uploadFileToCloudinary] Buffer created, publicId:", publicId);
  console.log("[uploadFileToCloudinary] Cloudinary config check:", {
    cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !!process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "studio-admin",
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
        secure: true,
      },
      (err, result) => {
        if (err) {
          console.error("[uploadFileToCloudinary] Cloudinary error:", err);
          return reject(err);
        }
        if (!result) {
          console.error("[uploadFileToCloudinary] No result returned");
          return reject(new Error("Upload failed"));
        }
        console.log("[uploadFileToCloudinary] Upload successful:", result.secure_url);
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

// ─── Duplicate-key guard ──────────────────────────────────────────────────────
const isDuplicate = (err: unknown) => err && typeof err === "object" && "code" in err && err.code === 11000;

export async function listCategories(): Promise<any[]> {
  await connectDB();

  const categories = await Category.find().sort({ name: 1 }).lean();
  return categories;
}

export async function getCategory(id: string): Promise<any> {
  await connectDB();

  const category = await Category.findById(id).lean();
  if (!category) {
    throw new ServiceError(404, "Category not found");
  }
  return category;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  count?: number;
  unit?: string;
  color?: string;
  initials?: string;
  image?: string;
  file?: File; // For image upload
}

export async function createCategory(data: CreateCategoryData): Promise<any> {
  await connectDB();

  try {
    console.log("[createCategory] Starting with data:", {
      name: data.name,
      hasFile: !!data.file,
      fileInfo: data.file ? { name: data.file.name, type: data.file.type, size: data.file.size } : null,
    });

    let imageUrl = data.image ?? "";

    // If file is provided, upload to Cloudinary
    if (data.file) {
      console.log("[createCategory] File detected, starting upload...");
      imageUrl = await uploadFileToCloudinary(data.file);
      console.log("[createCategory] Upload completed, imageUrl:", imageUrl);
    }

    const categoryData = {
      name: data.name,
      description: data.description ?? "",
      count: Number(data.count) || 0,
      unit: data.unit ?? "",
      color: data.color ?? "",
      initials: data.initials ?? "",
      image: imageUrl,
    };

    console.log("[createCategory] Creating category in DB with data:", categoryData);
    const category = await Category.create(categoryData);
    console.log("[createCategory] Category created successfully:", category._id);

    return category;
  } catch (err: unknown) {
    console.error("[createCategory] Error occurred:", err);
    if (isDuplicate(err)) {
      throw new ServiceError(409, `A category named "${data.name}" already exists`);
    }
    if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && "message" in err) {
      throw new ServiceError(422, String(err.message));
    }
    throw err;
  }
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  count?: number;
  unit?: string;
  color?: string;
  initials?: string;
  image?: string;
  file?: File; // For image upload
}

export async function updateCategory(id: string, data: UpdateCategoryData): Promise<any> {
  await connectDB();

  try {
    let imageUrl = data.image;

    // If file is provided, upload to Cloudinary
    if (data.file) {
      imageUrl = await uploadFileToCloudinary(data.file);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.count !== undefined) updateData.count = Number(data.count);
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.initials !== undefined) updateData.initials = data.initials;

    // Only overwrite image if a new file was uploaded or a URL was explicitly sent
    if (data.file || data.image !== undefined) {
      updateData.image = imageUrl;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!category) {
      throw new ServiceError(404, "Category not found");
    }
    return category;
  } catch (err: unknown) {
    if (isDuplicate(err)) {
      throw new ServiceError(409, `A category named "${data.name}" already exists`);
    }
    if (err && typeof err === "object" && "name" in err && err.name === "ValidationError" && "message" in err) {
      throw new ServiceError(422, String(err.message));
    }
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  await connectDB();

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new ServiceError(404, "Category not found");
  }
}

export async function bulkDeleteCategories(ids: string[]): Promise<{ deletedCount: number }> {
  await connectDB();

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const result = await Category.deleteMany({ _id: { $in: objectIds } });

  return { deletedCount: result.deletedCount };
}

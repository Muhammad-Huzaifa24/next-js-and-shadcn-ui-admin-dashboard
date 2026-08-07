"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { ImageIcon, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/store/categories-context";
import { type ProductOption, useProducts } from "@/store/products-context";

const OPTION_TYPES = ["Size", "Color", "Material", "Style"];
const SIZE_VALUES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_VALUES = ["Black", "White", "Red", "Blue", "Green", "Grey", "Navy", "Beige", "Pink"];
const MAX_IMAGES = 5;

export function EditProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { products, updateProduct } = useProducts();
  const { categories } = useCategories();

  const product = products.find((p) => p.id === productId);

  // Initialise state from existing product
  const [name, setName] = React.useState(product?.name ?? "");
  const [description, setDescription] = React.useState(product?.description ?? "");
  const [images, setImages] = React.useState<string[]>(product?.images ?? []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [price, setPrice] = React.useState(product?.price.replace("$", "") ?? "");
  const [discountPrice, setDiscountPrice] = React.useState(product?.discountPrice?.replace("$", "") ?? "");
  const [hasTax, setHasTax] = React.useState(product?.hasTax ?? false);
  const [hasOptions, setHasOptions] = React.useState(product?.hasOptions ?? false);
  const [options, setOptions] = React.useState<ProductOption[]>(
    product?.options?.length ? product.options : [{ type: "Size", values: [] }],
  );
  const [weight, setWeight] = React.useState(product?.weight ?? "");
  const [isDigital, setIsDigital] = React.useState(product?.isDigital ?? false);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    product?.category ? [product.category] : [],
  );
  const [tags, setTags] = React.useState<string[]>(product?.tags ?? []);
  const [tagInput, setTagInput] = React.useState("");
  const [seoTitle, setSeoTitle] = React.useState(product?.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = React.useState(product?.seoDesc ?? "");

  if (!product) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Product not found.{" "}
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => router.push("/dashboard/products")}
        >
          Go back
        </button>
      </div>
    );
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages((prev) => (prev.length < MAX_IMAGES ? [...prev, result] : prev));
        };
        reader.readAsDataURL(file);
      });
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim();
      if (!tags.includes(val)) setTags((p) => [...p, val]);
      setTagInput("");
    }
  }

  function updateOptionType(i: number, type: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, type } : o)));
  }

  function toggleOptionValue(i: number, value: string) {
    setOptions((prev) =>
      prev.map((o, idx) => {
        if (idx !== i) return o;
        const has = o.values.includes(value);
        return { ...o, values: has ? o.values.filter((v) => v !== value) : [...o.values, value] };
      }),
    );
  }

  function removeOptionValue(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, values: o.values.filter((v) => v !== value) } : o)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!price || Number(price) < 0) {
      toast.error("A valid price is required.");
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("Select at least one category.");
      return;
    }

    await updateProduct(productId, {
      name: name.trim(),
      description: description.trim(),
      category: selectedCategories[0],
      color: options.find((o) => o.type === "Color")?.values[0] ?? product?.color,
      price: `$${Number(price).toFixed(2)}`,
      discountPrice: discountPrice ? `$${Number(discountPrice).toFixed(2)}` : "",
      hasTax,
      images,
      hasOptions,
      options: hasOptions ? options : [],
      weight: weight.trim(),
      isDigital,
      tags,
      seoTitle: seoTitle.trim(),
      seoDesc: seoDesc.trim(),
    });

    toast.success(`"${name.trim()}" updated successfully.`);
    router.push("/dashboard/products");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          {/* Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="product-name">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="product-name"
                  placeholder="e.g. Summer T-Shirt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="product-desc">Product Description</Label>
                <RichTextEditor value={description} onChange={setDescription} placeholder="Describe your product..." />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Media{" "}
                <span className="ml-2 font-normal text-muted-foreground text-xs">
                  ({images.length}/{MAX_IMAGES})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {images.length < MAX_IMAGES && (
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-border border-dashed py-10 text-muted-foreground transition-colors hover:bg-muted/40"
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload className="size-5" />
                  <span className="font-medium text-foreground text-sm">Add File</span>
                  <span className="text-xs">Or drag and drop files (max {MAX_IMAGES})</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              )}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {images.map((src, i) => (
                    <div
                      key={src.slice(-20)}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                    >
                      {/* biome-ignore lint/performance/noImgElement: base64 */}
                      <img src={src} alt={`${i + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="destructive"
                          aria-label="Remove image"
                          onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      <div className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-xs backdrop-blur-sm">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                  {/* biome-ignore lint/suspicious/noArrayIndexKey: stable static array for empty image slots */}
                  {Array.from({ length: MAX_IMAGES - images.length }).map((_, i) => (
                    <button
                      key={`empty-${images.length + i}`}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square items-center justify-center rounded-lg border-2 border-border border-dashed text-muted-foreground transition-colors hover:bg-muted/40"
                    >
                      <ImageIcon className="size-5" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Price</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="product-price">
                    Product Price <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="product-price"
                    placeholder="0.00"
                    type="number"
                    min={0}
                    step={0.01}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="discount-price">Discount Price</Label>
                  <Input
                    id="discount-price"
                    placeholder="0.00"
                    type="number"
                    min={0}
                    step={0.01}
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="tax-switch" checked={hasTax} onCheckedChange={setHasTax} />
                <Label htmlFor="tax-switch" className="cursor-pointer font-normal">
                  Add tax for this product
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Different Options</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Switch id="options-switch" checked={hasOptions} onCheckedChange={setHasOptions} />
                <Label htmlFor="options-switch" className="cursor-pointer font-normal">
                  This product has multiple options
                </Label>
              </div>
              {hasOptions && (
                <div className="flex flex-col gap-4">
                  {/* biome-ignore lint/suspicious/noArrayIndexKey: options are user-managed and index represents position */}
                  {options.map((opt, i) => (
                    <div
                      key={`${opt.type}-${i}-${opt.values.join(",")}`}
                      className="flex flex-col gap-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">Option {i + 1}</p>
                        {options.length > 1 && (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setOptions((p) => p.filter((_, idx) => idx !== i))}
                          >
                            <X className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <Label>Type</Label>
                          <Select value={opt.type} onValueChange={(v) => updateOptionType(i, v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectGroup>
                                {OPTION_TYPES.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label>Values</Label>
                          <div className="flex min-h-8 flex-wrap gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5">
                            {opt.values.map((v) => (
                              <Badge key={v} variant="secondary" className="cursor-default gap-1">
                                {v}
                                <button type="button" onClick={() => removeOptionValue(i, v)}>
                                  <X className="size-2.5" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(opt.type === "Color" ? COLOR_VALUES : SIZE_VALUES).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleOptionValue(i, v)}
                            className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${opt.values.includes(v) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOptions((p) => [...p, { type: "Size", values: [] }])}
                    className="flex w-fit items-center gap-1 text-primary text-sm hover:underline"
                  >
                    <Plus className="size-3.5" /> Add Option
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  placeholder="0.00"
                  type="number"
                  min={0}
                  step={0.01}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={isDigital}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="digital-switch"
                  checked={isDigital}
                  onCheckedChange={(v) => {
                    setIsDigital(v);
                    if (v) setWeight("");
                  }}
                />
                <Label htmlFor="digital-switch" className="cursor-pointer font-normal">
                  This is a digital item
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Categories <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {categories.length === 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-sm">No categories yet.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/dashboard/categories/add")}
                  >
                    <Plus className="size-3.5" /> Create Category
                  </Button>
                </div>
              ) : (
                <>
                  <Select
                    onValueChange={(v) => {
                      if (!selectedCategories.includes(v)) setSelectedCategories((p) => [...p, v]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCategories.map((c) => (
                        <Badge key={c} variant="secondary" className="gap-1">
                          {c}
                          <button type="button" onClick={() => setSelectedCategories((p) => p.filter((x) => x !== c))}>
                            <X className="size-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                id="tag-input"
                placeholder="Type and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => setTags((p) => p.filter((t) => t !== tag))}>
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="seo-title">Title</Label>
                <Input
                  id="seo-title"
                  placeholder="SEO title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="seo-desc">Description</Label>
                <Textarea
                  id="seo-desc"
                  placeholder="SEO description"
                  rows={3}
                  className="resize-none"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="hidden justify-end gap-2 xl:flex">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push("/dashboard/products")}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Update Product
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2 xl:hidden">
          <Button type="button" variant="outline" size="sm" onClick={() => router.push("/dashboard/products")}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Update Product
          </Button>
        </div>
      </div>
    </form>
  );
}

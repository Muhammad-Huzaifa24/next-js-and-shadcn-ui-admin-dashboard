"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/store/categories-context";

const COLOR_OPTIONS = [
  { label: "Slate", value: "bg-slate-700" },
  { label: "Indigo", value: "bg-indigo-500" },
  { label: "Zinc", value: "bg-zinc-500" },
  { label: "Stone", value: "bg-stone-400" },
  { label: "Amber", value: "bg-amber-500" },
  { label: "Neutral", value: "bg-neutral-600" },
  { label: "Blue", value: "bg-blue-600" },
  { label: "Emerald", value: "bg-emerald-600" },
  { label: "Sky", value: "bg-sky-700" },
];

export function AddCategoryForm() {
  const router = useRouter();
  const { addCategory } = useCategories();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [color, setColor] = React.useState(COLOR_OPTIONS[0].value);
  const [visible, setVisible] = React.useState(true);
  const [image, setImage] = React.useState<string>("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const initials =
    name
      .split(" ")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "??";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    addCategory({
      name: name.trim(),
      count: 0,
      unit: "items",
      color,
      initials,
      image: image || undefined,
    });

    toast.success(`"${name.trim()}" created`);
    router.push("/dashboard/categories");
  }

  return (
    <form onSubmit={handleSave}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left column */}
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Category Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-name">
                  Category Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Summer Clothes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  placeholder="Short description of this category"
                  rows={3}
                  className="resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Color picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    aria-label={opt.label}
                    onClick={() => setColor(opt.value)}
                    className={`size-8 rounded-md ${opt.value} ring-offset-2 transition-all ${
                      color === opt.value ? "ring-2 ring-foreground" : "hover:ring-1 hover:ring-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-muted-foreground text-xs">
                Selected: {COLOR_OPTIONS.find((o) => o.value === color)?.label}
              </p>
            </CardContent>
          </Card>

          {/* Image upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Image</CardTitle>
            </CardHeader>
            <CardContent>
              {image ? (
                <div className="group relative overflow-hidden rounded-lg border">
                  {/* biome-ignore lint/performance/noImgElement: base64 preview */}
                  <img src={image} alt="Category preview" className="h-36 w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="rounded-md bg-destructive px-3 py-1 text-destructive-foreground text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="add-cat-image"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-muted-foreground transition-colors hover:bg-muted/40"
                >
                  <Upload className="size-4" />
                  <span className="font-medium text-foreground text-sm">Add File</span>
                  <span className="text-xs">Or drag and drop files</span>
                  <input
                    id="add-cat-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              {image ? (
                // biome-ignore lint/performance/noImgElement: base64 preview
                <img src={image} alt="Preview" className="h-36 w-full rounded-t-md object-cover" />
              ) : (
                <div
                  className={`flex h-36 items-center justify-center rounded-t-md font-bold text-3xl text-white/80 ${color}`}
                >
                  {initials}
                </div>
              )}
              <div className="px-4 pt-3">
                <p className="font-medium leading-none">{name || "Category Name"}</p>
                <p className="mt-1 text-muted-foreground text-xs">0 items</p>
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Switch id="visibility" checked={visible} onCheckedChange={setVisible} />
                <Label htmlFor="visibility" className="cursor-pointer font-normal">
                  Visible on site
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push("/dashboard/categories")}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

"use client";

import * as React from "react";

import { Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CategoryItem } from "@/store/categories-context";

export interface CategoryInfoPanelRef {
  getValues: () => { name: string; image: string; visible: boolean };
}

interface CategoryInfoPanelProps {
  category: CategoryItem;
  panelRef: React.RefObject<CategoryInfoPanelRef | null>;
}

export function CategoryInfoPanel({ category, panelRef }: CategoryInfoPanelProps) {
  const [visible, setVisible] = React.useState(true);
  const [categoryName, setCategoryName] = React.useState(category.name);
  const [image, setImage] = React.useState<string>(category.image ?? "");

  // Expose current values to parent via ref
  React.useImperativeHandle(panelRef, () => ({
    getValues: () => ({ name: categoryName, image, visible }),
  }));

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Visibility</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Info</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input id="cat-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Image</Label>
            {image ? (
              <div className="group relative overflow-hidden rounded-lg border">
                {/* biome-ignore lint/performance/noImgElement: base64 preview */}
                <img src={image} alt="Category" className="h-36 w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => setImage("")}
                    aria-label="Remove image"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="cat-image"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-border border-dashed py-8 text-muted-foreground transition-colors hover:bg-muted/40"
              >
                <Upload className="size-4" />
                <span className="font-medium text-foreground text-sm">Add File</span>
                <span className="text-xs">Or drag and drop files</span>
                <input id="cat-image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
              </label>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

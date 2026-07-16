"use client";

import * as React from "react";

import { Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CategoryInfoPanelProps {
  name: string;
}

export function CategoryInfoPanel({ name }: CategoryInfoPanelProps) {
  const [visible, setVisible] = React.useState(true);
  const [categoryName, setCategoryName] = React.useState(name);

  return (
    <div className="flex flex-col gap-4">
      {/* Visibility */}
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

      {/* Category Info */}
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
            <label
              htmlFor="cat-image"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-border border-dashed py-8 text-muted-foreground transition-colors hover:bg-muted/40"
            >
              <Upload className="size-4" />
              <span className="font-medium text-foreground text-sm">Add File</span>
              <span className="text-xs">Or drag and drop files</span>
              <input id="cat-image" type="file" accept="image/*" className="sr-only" />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

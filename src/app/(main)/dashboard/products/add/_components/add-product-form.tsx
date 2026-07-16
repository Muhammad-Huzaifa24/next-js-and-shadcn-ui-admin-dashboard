"use client";

import * as React from "react";

import Link from "next/link";

import { Upload, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["Women", "Men", "T-Shirt", "Hoodie", "Dress", "Jeans", "Jackets", "Accessories"];
const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France"];

const INITIAL_TAGS = ["T-Shirt", "Men Clothes", "Summer Collection"];

export function AddProductForm() {
  const [tags, setTags] = React.useState<string[]>(INITIAL_TAGS);
  const [tagInput, setTagInput] = React.useState("");
  const [hasOptions, setHasOptions] = React.useState(true);
  const [isDigital, setIsDigital] = React.useState(false);
  const [hasTax, setHasTax] = React.useState(false);

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* ── Left / main column ── */}
      <div className="flex flex-col gap-4 xl:col-span-2">
        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-name">Product Name</Label>
              <Input id="product-name" placeholder="Summer T-Shirt" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-desc">Product Description</Label>
              <Textarea id="product-desc" placeholder="Product description" rows={4} className="resize-none" />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-border border-dashed py-10 text-muted-foreground transition-colors hover:bg-muted/40"
            >
              <Upload className="size-5" />
              <span className="font-medium text-foreground text-sm">Add File</span>
              <span className="text-xs">Or drag and drop files</span>
              <input id="file-upload" type="file" multiple accept="image/*" className="sr-only" />
            </label>
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
                <Label htmlFor="product-price">Product Price</Label>
                <Input id="product-price" placeholder="Enter price" type="number" min={0} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="discount-price">Discount Price</Label>
                <Input id="discount-price" placeholder="Price at Discount" type="number" min={0} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="tax-switch" checked={hasTax} onCheckedChange={setHasTax} />
              <Label htmlFor="tax-switch" className="font-normal">
                Add tax for this product
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Different Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Different Options</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Switch id="options-switch" checked={hasOptions} onCheckedChange={setHasOptions} />
              <Label htmlFor="options-switch" className="font-normal">
                This product has multiple options
              </Label>
            </div>
            {hasOptions && (
              <div className="flex flex-col gap-3">
                <p className="font-medium text-sm">Option 1</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="option-name">Size</Label>
                    <Select defaultValue="size">
                      <SelectTrigger id="option-name">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectGroup>
                          <SelectItem value="size">Size</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                          <SelectItem value="material">Material</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Value</Label>
                    <div className="flex min-h-8 flex-wrap gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5">
                      {["S", "M", "L", "XL"].map((size) => (
                        <Badge key={size} variant="secondary" className="cursor-default gap-1">
                          {size}
                          <X className="size-2.5 cursor-pointer" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <button type="button" className="w-fit text-primary text-sm hover:underline">
                  + Add More
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" placeholder="Enter Weight" type="number" min={0} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c.toLowerCase().replace(/\s/g, "-")}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="digital-switch" checked={isDigital} onCheckedChange={setIsDigital} />
              <Label htmlFor="digital-switch" className="font-normal">
                This is digital item
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Right / sidebar column ── */}
      <div className="flex flex-col gap-4">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <Checkbox id={`cat-${cat}`} />
                <Label htmlFor={`cat-${cat}`} className="cursor-pointer font-normal">
                  {cat}
                </Label>
              </div>
            ))}
            <button type="button" className="mt-1 w-fit text-primary text-sm hover:underline">
              Create New
            </button>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tag-input">Add Tags</Label>
              <Input
                id="tag-input"
                placeholder="Enter tag name"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeTag(tag)}>
                    <X className="size-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="seo-title">Title</Label>
              <Input id="seo-title" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="seo-desc">Description</Label>
              <Textarea id="seo-desc" rows={4} className="resize-none" />
            </div>
          </CardContent>
        </Card>

        {/* Sticky actions (visible on desktop sidebar) */}
        <div className="hidden justify-end gap-2 xl:flex">
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">Cancel</Link>
          </Button>
          <Button>Save</Button>
        </div>
      </div>

      {/* Mobile bottom actions */}
      <div className="flex justify-end gap-2 xl:hidden">
        <Button variant="outline" asChild>
          <Link href="/dashboard/products">Cancel</Link>
        </Button>
        <Button>Save</Button>
      </div>
    </div>
  );
}

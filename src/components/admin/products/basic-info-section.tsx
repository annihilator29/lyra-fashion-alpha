/**
 * Basic Info Section
 * Product form - Basic information fields
 */

'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import type { ProductFormData } from './product-form';

// UI Components
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export function BasicInfoSection() {
  const { control, watch, setValue } = useFormContext<ProductFormData>();
  const price = watch('price');
  const compareAtPrice = watch('compareAtPrice');

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Silk Midi Dress" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slug */}
      <FormField
        control={control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug *</FormLabel>
            <FormControl>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-muted bg-muted text-muted-foreground text-sm">
                  lyrafashion.com/products/
                </span>
                <Input
                  {...field}
                  placeholder="silk-midi-dress"
                  className="rounded-l-none"
                />
              </div>
            </FormControl>
            <p className="text-sm text-muted-foreground">
              URL-friendly identifier (auto-generated from name)
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe your product..."
                className="min-h-[120px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Dresses">Dresses</SelectItem>
                <SelectItem value="Tops">Tops</SelectItem>
                <SelectItem value="Bottoms">Bottoms</SelectItem>
                <SelectItem value="Outerwear">Outerwear</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Price (cents) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="9999"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                ${(price / 100).toFixed(2)} USD
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="compareAtPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compare-at Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="12999"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Original price for sales
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost (for margin calc)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="5000"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                ${((compareAtPrice || 0) / 100).toFixed(2)} USD
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Tags */}
      <FormField
        control={control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <Input
                placeholder="silk, summer, sale (comma separated)"
                value={field.value?.join(', ')}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean);
                  field.onChange(tags);
                }}
              />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              Comma-separated tags for filtering
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Status */}
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">
                  Draft (Not visible on storefront)
                </SelectItem>
                <SelectItem value="active">
                  Active (Live on storefront)
                </SelectItem>
                <SelectItem value="archived">
                  Archived (Hidden, retained in system)
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

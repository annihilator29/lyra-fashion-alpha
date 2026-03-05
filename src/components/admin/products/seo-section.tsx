/**
 * SEO Section
 * Product form - SEO meta fields
 */

'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

// UI Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// Types
import type { ProductFormData } from './product-form';

export function SEOSection() {
  const { control, watch } = useFormContext<ProductFormData>();
  const metaTitle = watch('metaTitle');
  const metaDescription = watch('metaDescription');

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Meta Title */}
        <FormField
          control={control}
          name="metaTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Silk Midi Dress - Lyra Fashion"
                  maxLength={60}
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Recommended: 50-60 characters</span>
                <span>{metaTitle?.length || 0}/60</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Appears in search engine results and browser tabs
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Meta Description */}
        <FormField
          control={control}
          name="metaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Luxurious silk midi dress perfect for any occasion..."
                  maxLength={160}
                  className="min-h-[100px]"
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Recommended: 150-160 characters</span>
                <span>{metaDescription?.length || 0}/160</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Brief description shown in search results
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* SEO Preview */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="text-sm font-medium mb-3">Search Preview</h4>
        <div className="space-y-2">
          <div className="text-blue-600 dark:text-blue-400 text-lg hover:underline cursor-pointer">
            {metaTitle || 'Product Name - Lyra Fashion'}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            https://lyrafashion.com/products/product-slug
          </div>
          <div className="text-sm text-muted-foreground">
            {metaDescription || 'Product description will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
}

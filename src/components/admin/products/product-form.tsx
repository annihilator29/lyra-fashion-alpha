/**
 * Product Form - Main Container Component
 * Story 7.2: Product Management Interface
 * Phase 3: Product Form Components
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { Package, Image, Layers, Search, FileText, Save, Eye, Loader2 } from 'lucide-react';

// Form Sections
import { BasicInfoSection } from './basic-info-section';
import { MediaSection } from './media-section';
import { VariantsSection } from './variants-section';
import { SEOSection } from './seo-section';
import { CraftsmanshipSection } from './craftsmanship-section';

// Validation Schema
const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1, 'SKU is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  colorHex: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid hex color').optional().or(z.literal('')),
  priceModifier: z.number().default(0),
  inventory: z.number().int().min(0, 'Inventory cannot be negative'),
  isOutOfStock: z.boolean().default(false),
});

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional().or(z.literal(0)),
  cost: z.number().positive().optional().or(z.literal(0)),
  category: z.enum(['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  status: z.enum(['draft', 'active', 'archived']),
  metaTitle: z.string().max(60).optional().or(z.literal('')),
  metaDescription: z.string().max(160).optional().or(z.literal('')),
  craftsmanshipContent: z.object({
    materials: z.object({
      fabric: z.string().optional(),
      origin: z.string().optional(),
      composition: z.string().optional(),
    }).optional(),
    construction: z.array(z.string()).optional(),
    qualityChecks: z.array(z.string()).optional(),
    careInstructions: z.array(z.string()).optional(),
  }).optional(),
  variants: z.array(productVariantSchema).min(1, 'At least one variant is required'),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: ProductFormData;
  productId?: string;
  onSubmit: (data: ProductFormData) => Promise<{ success: boolean; message?: string; error?: string }>;
}

export function ProductForm({ mode, initialData, productId, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form with react-hook-form and zod validation
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      description: '',
      price: 0,
      compareAtPrice: 0,
      cost: 0,
      category: 'Dresses',
      tags: [],
      images: [],
      status: 'draft',
      metaTitle: '',
      metaDescription: '',
      craftsmanshipContent: {
        materials: {},
        construction: [],
        qualityChecks: [],
        careInstructions: [],
      },
      variants: [
        {
          sku: '',
          size: 'S',
          color: '',
          colorHex: '',
          priceModifier: 0,
          inventory: 0,
          isOutOfStock: false,
        },
      ],
    },
    mode: 'onChange',
    reValidateMode: 'onBlur',
  });

  const { handleSubmit, formState, watch, setValue } = methods;
  const { errors, isDirty } = formState;

  // Watch name field to auto-generate slug
  const nameValue = watch('name');

  // Auto-generate slug from name when name changes (only in create mode)
  React.useEffect(() => {
    if (mode === 'create' && nameValue && !watch('slug')) {
      const generatedSlug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', generatedSlug);
    }
  }, [nameValue, mode, setValue, watch]);

  // Handle form submission
  const onFormSubmit = useCallback(async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      const result = await onSubmit(data);

      if (result.success) {
        toast.success(result.message || `Product ${mode === 'create' ? 'created' : 'updated'} successfully`);
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, onSubmit, router]);

  // Handle save as draft
  const handleSaveAsDraft = useCallback(async () => {
    const currentData = watch();
    currentData.status = 'draft';
    await onFormSubmit(currentData);
  }, [watch, onFormSubmit]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    const currentData = watch();
    currentData.status = 'active';
    await onFormSubmit(currentData);
  }, [watch, onFormSubmit]);

  // Handle preview
  const handlePreview = useCallback(() => {
    if (productId) {
      window.open(`/products/${watch('category').toLowerCase()}/${watch('slug')}?preview=true`, '_blank');
    } else {
      toast.info('Please save the product first to preview');
    }
  }, [productId, watch]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="container mx-auto px-4 py-8 pb-20">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {mode === 'create' ? 'Create Product' : 'Edit Product'}
                </h1>
                <p className="text-muted-foreground">
                  {mode === 'create'
                    ? 'Add a new product to your catalog'
                    : `Editing: ${initialData?.name || 'Product'}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                {mode === 'edit' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={isSubmitting}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {mode === 'create' ? 'Create Product' : 'Save Changes'}
                    </>
                  )}
                </Button>
                {mode === 'edit' && (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    variant="default"
                  >
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Form Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
              <TabsTrigger value="variants" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Variants</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
              <TabsTrigger value="craftsmanship" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Craftsmanship</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <ScrollArea className="h-[calc(100vh-300px)]">
              <TabsContent value="basic" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Enter the core details about your product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BasicInfoSection />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>
                      Upload and manage product images (max 10 images, 5MB each)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MediaSection />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="variants" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>
                      Configure sizes, colors, SKUs, and inventory
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VariantsSection />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>
                      Optimize your product for search engines
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SEOSection />
                    <Separator className="my-6" />
                    <CraftsmanshipSection />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="craftsmanship" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Craftsmanship Details</CardTitle>
                    <CardDescription>
                      Share the story behind your product's quality and construction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CraftsmanshipSection />
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          {/* Form Status Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {isDirty ? (
                  <span className="text-amber-600">● Unsaved changes</span>
                ) : (
                  <span>✓ All changes saved</span>
                )}
                {Object.keys(errors).length > 0 && (
                  <span className="ml-4 text-red-600">
                    ! {Object.keys(errors).length} field(s) need attention
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAsDraft}
                  disabled={isSubmitting || !isDirty}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

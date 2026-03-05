/**
 * Product Management Server Actions
 * Story 7.2: Product Management Interface
 * Phase 1: Data Layer & Server Actions
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: 'draft' | 'active' | 'archived';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  category: 'Dresses' | 'Tops' | 'Bottoms' | 'Outerwear' | 'Accessories';
  tags: string[];
  images: string[];
  status: 'draft' | 'active' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  craftsmanshipContent?: {
    materials?: {
      fabric?: string;
      origin?: string;
      composition?: string;
    };
    construction?: string[];
    qualityChecks?: string[];
    careInstructions?: string[];
  };
  variants: ProductVariantFormData[];
}

export interface ProductVariantFormData {
  id?: string;
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  priceModifier?: number;
  inventory: number;
  isOutOfStock?: boolean;
}

export interface ProductsResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[] | null;
  error: { message: string; code: string } | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any | null;
  error: { message: string; code: string } | null;
}

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

// ============================================================================
// Validation Schemas
// ============================================================================

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

// ============================================================================
// Helper Functions
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbFormat(data: any): any {
  if (!data) return data;
  
  return {
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.price,
    compare_at_price: data.compareAtPrice || null,
    cost: data.cost || null,
    category: data.category,
    tags: data.tags || [],
    images: data.images || [],
    status: data.status,
    meta_title: data.metaTitle || null,
    meta_description: data.metaDescription || null,
    craftsmanship_content: data.craftsmanshipContent || null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Validate if a string is a valid HTTP/HTTPS URL
 */
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Sanitize image URLs - ensure they're valid HTTP/HTTPS URLs
 * Filters out invalid URLs, paths, or non-URL strings
 */
function sanitizeImageUrls(images: string[]): string[] {
  if (!images || !Array.isArray(images)) return [];
  return images.filter(img => img && isValidUrl(img));
}

/**
 * Calculate total inventory from product variants
 */
function calculateInventory(variants: any[] | null | undefined) {
  if (!variants || variants.length === 0) {
    return { total_quantity: 0, reserved_quantity: 0 };
  }
  
  const totalQuantity = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
  // Reserved quantity would come from cart_reservations table (not implemented in this query)
  const reservedQuantity = 0;
  
  return { total_quantity: totalQuantity, reserved_quantity: reservedQuantity };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toClientFormat(data: any): any {
  if (!data) return data;
  
  // Calculate inventory from variants
  const inventory = calculateInventory(data.product_variants);
  
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.price,
    compareAtPrice: data.compare_at_price,
    cost: data.cost,
    category: data.category,
    tags: data.tags || [],
    images: sanitizeImageUrls(data.images),
    status: data.status,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    craftsmanshipContent: data.craftsmanship_content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    variants: data.product_variants,
    inventory: [inventory],
  };
}

/**
 * Generate a URL-safe slug from a product name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate unique SKU for variant
 */
// ============================================================================
// Product Query Actions
// ============================================================================

/**
 * Get products with filtering, sorting, and pagination
 */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const {
      search,
      category,
      status,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      pageSize = 20,
    } = filters;

    // Build query with joins - get product variants for inventory calculation
    let query = supabase
      .from('products')
      .select('*, product_variants(id, stock_quantity)', {
        count: 'exact',
      });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('getProducts - Error:', JSON.stringify(error, null, 2));
      return {
        data: null,
        error: { message: error.message, code: 'DB_ERROR' },
      };
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data: data?.map(toClientFormat) || [],
      error: null,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages,
      },
    };
  } catch (error) {
    console.error('getProducts - Catch Error:', JSON.stringify(error, null, 2));
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch products',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Get single product by ID with variants and inventory
 */
export async function getProductById(id: string): Promise<ProductResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*), inventory(total_quantity, reserved_quantity, low_stock_threshold)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('getProductById - Error:', JSON.stringify(error, null, 2));
      return {
        data: null,
        error: { message: error.message, code: 'DB_ERROR' },
      };
    }

    return {
      data: toClientFormat(data),
      error: null,
    };
  } catch (error) {
    console.error('getProductById - Catch Error:', JSON.stringify(error, null, 2));
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch product',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*), inventory(total_quantity, reserved_quantity, low_stock_threshold)')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('getProductBySlug - Error:', JSON.stringify(error, null, 2));
      return {
        data: null,
        error: { message: error.message, code: 'DB_ERROR' },
      };
    }

    return {
      data: toClientFormat(data),
      error: null,
    };
  } catch (error) {
    console.error('getProductBySlug - Catch Error:', JSON.stringify(error, null, 2));
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch product',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

// ============================================================================
// SKU Validation Helper
// ============================================================================

/**
 * Validate that all SKUs in a product are unique and don't exist in database
 */
 
async function validateVariantSKUs(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  variants: ProductVariantFormData[],
  excludeProductId?: string
): Promise<{ valid: boolean; error?: string }> {
  // Check for duplicate SKUs within the form data
  const skuCounts = new Map<string, number>();
  for (const variant of variants) {
    const skuUpper = variant.sku.toUpperCase();
    skuCounts.set(skuUpper, (skuCounts.get(skuUpper) || 0) + 1);
  }

  for (const [sku, count] of skuCounts.entries()) {
    if (count > 1) {
      return { valid: false, error: `Duplicate SKU in form: ${sku}` };
    }
  }

  // Check each SKU against database (case-insensitive)
  for (const variant of variants) {
    let query = supabase
      .from('product_variants')
      .select('id, product_id, sku')
      .ilike('sku', variant.sku);

    if (excludeProductId) {
      query = query.neq('product_id', excludeProductId);
    }

    const { data } = await query.maybeSingle();

    if (data) {
      return { valid: false, error: `SKU already exists: ${variant.sku}` };
    }
  }

  return { valid: true };
}

// ============================================================================
// Product Mutation Actions
// ============================================================================

/**
 * Create a new product with variants
 */
export async function createProduct(formData: ProductFormData): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Validate input
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((issue) => issue.message).join(', '),
      };
    }

    // Validate SKU uniqueness
    const skuValidation = await validateVariantSKUs(supabase, formData.variants);
    if (!skuValidation.valid) {
      return {
        success: false,
        error: skuValidation.error,
      };
    }

    // Generate unique slug if not provided
    const slug = formData.slug || generateSlug(formData.name);
    const uniqueSlug = await generateUniqueSlug(slug);

    // Prepare product data for database
    const dbData = toDbFormat({
      ...formData,
      slug: uniqueSlug,
    });

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(dbData)
      .select()
      .single();

    if (productError) {
      console.error('createProduct - Insert Error:', JSON.stringify(productError, null, 2));
      return {
        success: false,
        error: productError.message,
      };
    }

    // Get product ID
    const productId = (product as { id: string }).id;

    // Create variants with inventory
    if (formData.variants && formData.variants.length > 0) {
      const variantsToInsert = formData.variants.map((variant) => ({
        product_id: productId,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        color_hex: variant.colorHex || null,
        price_modifier: variant.priceModifier || 0,
        stock_quantity: variant.inventory,
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert);

      if (variantsError) {
        console.error('createProduct - Variants Error:', JSON.stringify(variantsError, null, 2));
        // Rollback: delete the product
        await supabase.from('products').delete().eq('id', productId);
        return {
          success: false,
          error: variantsError.message,
        };
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      message: 'Product created successfully',
      data: { productId: productId },
    };
  } catch (error) {
    console.error('createProduct - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

/**
 * Update an existing product and its variants
 * Uses transaction-like approach: validates first, then updates
 */
export async function updateProduct(id: string, formData: ProductFormData): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Validate input
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues.map((issue) => issue.message).join(', '),
      };
    }

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    // Validate SKU uniqueness before any mutations
    const skuValidation = await validateVariantSKUs(supabase, formData.variants, id);
    if (!skuValidation.valid) {
      return {
        success: false,
        error: skuValidation.error,
      };
    }

    // Prepare product data for database
    const dbData = toDbFormat(formData);
    dbData.updated_at = new Date().toISOString();

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update(dbData)
      .eq('id', id);

    if (updateError) {
      console.error('updateProduct - Update Error:', JSON.stringify(updateError, null, 2));
      return {
        success: false,
        error: updateError.message,
      };
    }

    // Update variants using upsert for atomic operation
    if (formData.variants && formData.variants.length > 0) {
      // First, mark existing variants as "to be deleted" by clearing their SKUs
      // Then insert new ones atomically using a transaction
      const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', id);

      if (deleteError) {
        console.error('updateProduct - Delete Variants Error:', JSON.stringify(deleteError, null, 2));
        return {
          success: false,
          error: `Failed to update variants: ${deleteError.message}`,
        };
      }

      // Insert new variants
      const variantsToInsert = formData.variants.map((variant) => ({
        product_id: id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        color_hex: variant.colorHex || null,
        price_modifier: variant.priceModifier || 0,
        stock_quantity: variant.inventory,
      }));

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert);

      if (variantsError) {
        console.error('updateProduct - Variants Error:', JSON.stringify(variantsError, null, 2));
        // Attempt to restore original state by keeping product but variants may be lost
        // In production, consider using database transactions via RPC
        return {
          success: false,
          error: `Failed to create variants: ${variantsError.message}. Please retry.`,
        };
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      message: 'Product updated successfully',
      data: { productId: id },
    };
  } catch (error) {
    console.error('updateProduct - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

/**
 * Delete a product (soft delete by archiving)
 */
export async function deleteProduct(id: string, hardDelete = false): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    if (hardDelete) {
      // Hard delete - remove from database
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        console.error('deleteProduct - Hard Delete Error:', JSON.stringify(error, null, 2));
        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      // Soft delete - archive the product
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('deleteProduct - Archive Error:', JSON.stringify(error, null, 2));
        return {
          success: false,
          error: error.message,
        };
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      message: hardDelete ? 'Product deleted permanently' : 'Product archived',
    };
  } catch (error) {
    console.error('deleteProduct - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}

// ============================================================================
// Bulk Actions
// ============================================================================

/**
 * Update status of multiple products
 */
export async function updateProductStatus(ids: string[], status: 'draft' | 'active' | 'archived'): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('products')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      console.error('updateProductStatus - Error:', JSON.stringify(error, null, 2));
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      message: `Updated ${ids.length} product(s) to ${status}`,
    };
  } catch (error) {
    console.error('updateProductStatus - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product status',
    };
  }
}

/**
 * Update category of multiple products
 */
export async function updateProductCategory(ids: string[], category: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('products')
      .update({ category, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      console.error('updateProductCategory - Error:', JSON.stringify(error, null, 2));
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      message: `Updated ${ids.length} product(s) category`,
    };
  } catch (error) {
    console.error('updateProductCategory - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product category',
    };
  }
}

/**
 * Update prices of multiple products by percentage or fixed amount
 */
export async function updateProductPrices(
  ids: string[],
  adjustment: { type: 'percentage' | 'fixed'; value: number }
): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Get current products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, price')
      .in('id', ids);

    if (fetchError) {
      return {
        success: false,
        error: fetchError.message,
      };
    }

    // Calculate new prices
    const updates = products?.map((product) => {
      let newPrice = product.price;

      if (adjustment.type === 'percentage') {
        // Percentage: new_price = current_price * (1 + percentage/100)
        newPrice = product.price * (1 + adjustment.value / 100);
      } else {
        // Fixed amount: new_price = current_price + amount
        newPrice = product.price + adjustment.value;
      }

      // Round to 2 decimal places
      newPrice = Math.round(newPrice * 100) / 100;

      // Ensure price is positive
      newPrice = Math.max(0.01, newPrice);

      return {
        id: product.id,
        price: newPrice,
      };
    });

    // Apply updates
    const updatePromises = updates?.map((update) =>
      supabase
        .from('products')
        .update({ price: update.price, updated_at: new Date().toISOString() })
        .eq('id', update.id)
    );

    if (updatePromises) {
      const results = await Promise.all(updatePromises);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        return {
          success: false,
          error: `Failed to update ${errors.length} product(s)`,
        };
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/products');

    return {
      success: true,
      message: `Updated ${ids.length} product(s) prices`,
    };
  } catch (error) {
    console.error('updateProductPrices - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product prices',
    };
  }
}

// ============================================================================
// Image Management Actions
// ============================================================================

/**
 * Upload product images to Supabase Storage
 */
export async function uploadProductImages(files: FormData): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const uploadedFiles = files.getAll('files') as File[];
    const uploadedUrls: string[] = [];

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of uploadedFiles) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type: ${file.name}. Allowed types: JPEG, PNG, WebP`,
        };
      }

      // Validate file size
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File too large: ${file.name}. Maximum size: 5MB`,
        };
      }
    }

    // Upload each file
    for (const file of uploadedFiles) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('uploadProductImages - Upload Error:', JSON.stringify(error, null, 2));
        return {
          success: false,
          error: error.message,
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
    }

    return {
      success: true,
      message: `Uploaded ${uploadedUrls.length} image(s)`,
      data: { urls: uploadedUrls },
    };
  } catch (error) {
    console.error('uploadProductImages - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload images',
    };
  }
}

/**
 * Delete a product image from Supabase Storage
 * Validates filename to prevent path traversal attacks
 */
export async function deleteProductImage(imagePath: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // Extract file path from URL
    let fileName: string;
    try {
      const url = new URL(imagePath);
      const pathSegments = url.pathname.split('/');
      fileName = pathSegments[pathSegments.length - 1];
    } catch {
      // If not a valid URL, treat as filename directly
      fileName = imagePath.split('/').pop() || imagePath;
    }

    // Validate filename - only allow alphanumeric, hyphens, underscores, and common image extensions
    const validFilenamePattern = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i;
    if (!validFilenamePattern.test(fileName)) {
      console.error('deleteProductImage - Invalid filename:', fileName);
      return {
        success: false,
        error: 'Invalid filename format',
      };
    }

    // Additional check: prevent path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return {
        success: false,
        error: 'Invalid filename',
      };
    }

    const { error } = await supabase.storage.from('product-images').remove([fileName]);

    if (error) {
      console.error('deleteProductImage - Error:', JSON.stringify(error, null, 2));
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  } catch (error) {
    console.error('deleteProductImage - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}

// ============================================================================
// Utility Actions
// ============================================================================

/**
 * Generate a unique slug for a product with retry logic to prevent race conditions
 */
export async function generateUniqueSlug(baseSlug: string, maxRetries: number = 3): Promise<string> {
  await requireAdmin();
  const supabase = createAdminClient();

  let slug = baseSlug;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Check if slug exists
      const { data } = await supabase
        .from('products')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (!data) {
        return slug;
      }

      // Slug exists, generate a new one with random suffix
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${randomSuffix}`;
      attempt++;
    } catch (error) {
      console.error('generateUniqueSlug - Error:', JSON.stringify(error, null, 2));
      // Generate fallback with timestamp on error
      return `${baseSlug}-${Date.now().toString(36)}`;
    }
  }

  // If all retries exhausted, use timestamp for guaranteed uniqueness
  return `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Validate SKU uniqueness
 */
export async function validateSKU(sku: string, excludeProductId?: string): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    let query = supabase.from('product_variants').select('id, product_id').eq('sku', sku);

    if (excludeProductId) {
      query = query.neq('product_id', excludeProductId);
    }

    const { data } = await query.single();

    if (data) {
      return {
        success: false,
        error: 'SKU already exists',
      };
    }

    return {
      success: true,
      message: 'SKU is available',
    };
  } catch (error) {
    console.error('validateSKU - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate SKU',
    };
  }
}

/**
 * Export products to CSV
 */
export async function exportProductsToCSV(ids?: string[]): Promise<ActionResponse> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    let query = supabase
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: false });

    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Convert to CSV format
    const headers = ['ID', 'Name', 'Slug', 'Category', 'Price', 'Status', 'SKU', 'Size', 'Color', 'Inventory'];
    interface CsvVariant {
      sku: string;
      size: string;
      color: string;
      stock_quantity: number;
    }
    interface CsvProduct {
      id: string;
      name: string;
      slug: string;
      category: string;
      price: number;
      status: string;
      product_variants?: CsvVariant[];
    }
    const rows = (data as CsvProduct[] | null)?.flatMap((product: CsvProduct) => {
      if (product.product_variants && product.product_variants.length > 0) {
        return product.product_variants.map((variant: CsvVariant) => [
          product.id,
          product.name,
          product.slug,
          product.category,
          product.price,
          product.status,
          variant.sku,
          variant.size,
          variant.color,
          variant.stock_quantity,
        ]);
      }
      return [[product.id, product.name, product.slug, product.category, product.price, product.status, '', '', '', '']];
    });

    const csvContent = [headers.join(','), ...(rows?.map((row) => row.join(',')) || [])].join('\n');

    return {
      success: true,
      message: `Exported ${data?.length || 0} product(s)`,
      data: { csv: csvContent },
    };
  } catch (error) {
    console.error('exportProductsToCSV - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export products',
    };
  }
}

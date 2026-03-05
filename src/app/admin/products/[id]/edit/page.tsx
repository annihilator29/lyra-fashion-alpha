/**
 * Edit Product Page
 * Story 7.2: Product Management Interface
 * Phase 6: Product Pages
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { ProductForm } from '@/components/admin/products/product-form';
import { updateProduct, getProductById } from '@/app/admin/products/actions';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const { id } = await params;

  // Fetch product data
  const productResult = await getProductById(id);

  if (productResult.error || !productResult.data) {
    redirect('/admin/products');
  }

  const product = productResult.data;

  // Transform data for form
  const initialData = {
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: product.price,
    compareAtPrice: product.compareAtPrice || 0,
    cost: product.cost || 0,
    category: product.category as any,
    tags: product.tags || [],
    images: product.images || [],
    status: product.status as any,
    metaTitle: product.metaTitle || '',
    metaDescription: product.metaDescription || '',
    craftsmanshipContent: product.craftsmanshipContent || {
      materials: {},
      construction: [],
      qualityChecks: [],
      careInstructions: [],
    },
    variants: product.variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.color_hex || '',
      priceModifier: v.price_modifier || 0,
      inventory: v.stock_quantity || 0,
      isOutOfStock: v.stock_quantity === 0,
    })) || [],
  };

  return (
    <ProductForm
      mode="edit"
      productId={id}
      initialData={initialData}
      onSubmit={async (data) => {
        'use server';
        return await updateProduct(id, data);
      }}
    />
  );
}

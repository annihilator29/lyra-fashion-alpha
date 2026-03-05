/**
 * Create New Product Page
 * Story 7.2: Product Management Interface
 * Phase 6: Product Pages
 */

import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/roles';
import { ProductForm } from '@/components/admin/products/product-form';
import { createProduct } from '@/app/admin/products/actions';

export default async function NewProductPage() {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  return (
    <ProductForm
      mode="create"
      onSubmit={async (data) => {
        'use server';
        return await createProduct(data);
      }}
    />
  );
}

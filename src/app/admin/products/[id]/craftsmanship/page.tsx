/**
 * Admin Craftsmanship Editor Page
 * 
 * Server component that loads product data and renders the craftsmanship editor.
 * 
 * @module app/admin/products/[id]/craftsmanship/page
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { CraftsmanshipEditorForm } from '@/components/admin/craftsmanship-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CraftsmanshipEditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CraftsmanshipEditorPage({
  params
}: CraftsmanshipEditorPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch product with existing craftsmanship content
  const { data: product, error } = await supabase
    .from('products')
    .select('*, craftsmanship_content')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Get current user for authorization check
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin/products/' + id + '/craftsmanship');
  }

  // Check if user has admin role (simplified check - in production use proper role checking)
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('id', user.id)
    .single();

  // For now, allow any authenticated user to access admin
  // In production, implement proper role-based access control
  const isAdmin = !!customer;

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You do not have permission to edit craftsmanship content.</p>
          <Link href="/">
            <Button className="mt-4">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb navigation */}
      <div className="mb-6">
        <Link 
          href={`/admin/products/${id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to product
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-primary mb-2">
          Edit Craftsmanship
        </h1>
        <p className="text-gray-600">
          Manage craftsmanship details for: <strong>{product.name}</strong>
        </p>
      </div>

      {/* Editor form */}
      <CraftsmanshipEditorForm
        productId={product.id}
        initialData={product.craftsmanship_content}
        productName={product.name}
      />
    </div>
  );
}

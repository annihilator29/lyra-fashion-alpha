/**
 * Admin Order Detail Page (Server Component)
 * Story 6.1: Order Status Tracking System (Task 6)
 */

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import AdminOrderDetailPage from './AdminOrderDetailClient';
import type { OrderWithItems } from '@/types/order';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailServer({ params }: PageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const { id } = await params;

  const supabase = await createClient();

  // Fetch order with items
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !order) {
    console.error('Error fetching order:', error);
    notFound();
  }

  return <AdminOrderDetailPage order={order as OrderWithItems} />;
}

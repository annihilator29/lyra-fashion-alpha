/**
 * Order Confirmation Page
 * Story 3-4: Order Confirmation & Email Notification
 * Displays order details, factory messaging, and next steps
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { OrderConfirmationContent } from './order-confirmation-content';

interface OrderConfirmationPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export async function generateMetadata({ params }: OrderConfirmationPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order Confirmation ${orderId} - Lyra Fashion`,
    description: 'View your order details and track your purchase from Lyra Fashion',
    robots: 'noindex, nofollow',
  };
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderId } = await params;

  // Fetch order with items
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  return <OrderConfirmationContent order={order} />;
}

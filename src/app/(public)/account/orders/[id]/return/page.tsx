import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ReturnRequestForm } from '@/components/returns/return-request-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import type { OrderWithItems } from '@/types/order';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReturnPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  // Fetch order with items and check eligibility
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
    .eq('customer_id', user.id)
    .single();

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-red-700">
            We couldn&apos;t find the order you&apos;re looking for.
          </p>
          <Button asChild className="mt-4">
            <Link href="/account/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if order is delivered
  if (order.status !== 'delivered' || !order.delivered_at) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Order Not Eligible for Return
          </h2>
          <p className="text-yellow-700">
            Returns can only be initiated for delivered orders. This order is currently {order.status}.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/account/orders/${order.id}`}>Back to Order</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Check if within 30-day return window
  const deliveredDate = new Date(order.delivered_at);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 30) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Return Window Expired
          </h2>
          <p className="text-yellow-700">
            This order was delivered on {deliveredDate.toLocaleDateString()}. 
            Our 30-day return window has expired.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/account/orders/${order.id}`}>Back to Order</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/account/orders/${order.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Request a Return</h1>
        <p className="text-muted-foreground mt-2">
          Order #{order.order_number || order.id.slice(0, 8)} • Delivered on{' '}
          {deliveredDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Days Remaining */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800">
          <strong>{30 - diffDays} days remaining</strong> to return items from this order.
        </p>
      </div>

      {/* Return Form */}
      <ReturnRequestForm order={order as OrderWithItems} />

      {/* Return Policy Info */}
      <div className="mt-12 border-t pt-8">
        <h3 className="font-semibold mb-4">Return Policy</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Items must be returned within 30 days of delivery</li>
          <li>• Items must be unworn, unwashed, and have original tags attached</li>
          <li>• Final sale items cannot be returned</li>
          <li>• Full refund (100% of item price) - no restocking fees</li>
          <li>• Refunds processed within 5-7 business days after receipt</li>
        </ul>
      </div>
    </div>
  );
}

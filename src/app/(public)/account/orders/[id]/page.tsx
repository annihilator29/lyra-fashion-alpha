import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import OrderDetailHeader from '@/components/account/OrderDetailHeader';
import OrderStatusTimeline from '@/components/account/OrderStatusTimeline';
import OrderItemsList from '@/components/account/OrderItemsList';
import ShippingAddressDisplay from '@/components/account/ShippingAddressDisplay';
import TrackingLink from '@/components/account/TrackingLink';
import OrderDetailClient from '@/components/account/OrderDetailClient';
import type { OrderWithItems } from '@/types/order';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;

  // Fetch single order with items and products
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
    console.error('Error fetching order:', error);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-red-700">
            We couldn&apos;t find the order you&apos;re looking for. Please check your order history or contact support if the problem persists.
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 mt-4"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <OrderDetailHeader order={order as OrderWithItems} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Status Timeline */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          <OrderStatusTimeline order={order as OrderWithItems} />
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Shipping Address */}
          {order.shipping_address && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <ShippingAddressDisplay address={order.shipping_address} />
            </div>
          )}

          {/* Order Items */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <OrderItemsList order={order as OrderWithItems} />
          </div>

          {/* Tracking Information */}
          {(order.status === 'shipped' || order.status === 'delivered') && order.tracking_number && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Track Your Package</h2>
              <TrackingLink
                trackingNumber={order.tracking_number!}
                carrier={order.carrier || undefined}
              />
            </div>
          )}

          {/* Actions */}
          <OrderDetailClient order={order as OrderWithItems} />
        </div>
      </div>
    </div>
  );
}

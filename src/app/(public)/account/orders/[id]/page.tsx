import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import OrderDetailHeader from '@/components/account/OrderDetailHeader';
import OrderItemsList from '@/components/account/OrderItemsList';
import ShippingAddressDisplay from '@/components/account/ShippingAddressDisplay';
import OrderStatusTimeline from '@/components/account/OrderStatusTimeline';
import TrackingLink from '@/components/account/TrackingLink';
import type { OrderWithItems } from '@/types/order';
import { reorderItems } from '@/app/account/actions';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch single order with all associated data
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
            Order not found
          </h2>
          <p className="text-red-700 mb-6">
            The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return <OrderDetailContent order={order as OrderWithItems} />;
}

function OrderDetailContent({ order }: { order: OrderWithItems }) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Header */}
      <OrderDetailHeader order={order} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <OrderItemsList order={order} />
          </section>
        </div>

        <div className="space-y-6">
          {/* Status Timeline */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <OrderStatusTimeline order={order} />
          </section>

          {/* Shipping Address */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <ShippingAddressDisplay address={order.shipping_address} />
          </section>

          {/* Tracking Information */}
          {order.tracking_number && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Tracking Information</h2>
              <TrackingLink
                trackingNumber={order.tracking_number}
                carrier={order.carrier || undefined}
              />
            </section>
          )}
        </div>
      </div>

      {/* Reorder Section */}
      <section className="mt-8 pt-8 border-t">
        <ReorderForm orderId={order.id} />
      </section>
    </div>
  );
}

async function ReorderForm({ orderId }: { orderId: string }) {
  const result = await reorderItems(orderId);

  if (result.error) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <p className="text-sm text-green-900">
        Successfully added {result.data?.itemCount || 0} items to your cart!
      </p>
      <Link
        href="/cart"
        className="inline-flex items-center justify-center rounded-md bg-primary mt-3 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        View Cart
      </Link>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isAdmin } from '@/lib/auth/roles';
import { ProductionStages } from '@/components/orders/production-stages';
import { ProductionStageUpdateForm } from '@/components/orders/production-update-form';
import type { OrderWithItems } from '@/types/order';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProductionDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/login');
  }

  const { id } = await params;

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
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Order Not Found
          </h2>
          <Link
            href="/admin/production"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 mt-4"
          >
            Back to Production Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Only allow access to orders in production or quality_check
  if (order.status !== 'production' && order.status !== 'quality_check') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Order Not in Production
          </h2>
          <p className="text-yellow-700 mb-4">
            This order is currently in &quot;{order.status}&quot; status. Production updates are only available for orders in production or quality check.
          </p>
          <Link
            href="/admin/production"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Production Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Production Update: Order {order.order_number || order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600 mt-1">
            Update production stages and track progress
          </p>
        </div>
        <Link
          href="/admin/production"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Order Info & Production Stages */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order.order_number || order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{order.customer_email || 'Guest'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ordered:</span>
                <span className="font-medium">
                  {new Date(order.ordered_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Current Production Stages */}
          {order.production_stages && (
            <ProductionStages 
              stages={order.production_stages as NonNullable<OrderWithItems['production_stages']>}
              showCraftsmanshipMessage={false}
            />
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items?.map((item: { 
                id: string; 
                products?: { name: string; images: string[] }; 
                quantity: number;
                variant?: { size?: string; color?: string };
              }) => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.products?.images?.[0] && (
                    <Image
                      src={item.products.images[0]}
                      alt={item.products.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.products?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                      {item.variant?.size && ` • Size: ${item.variant.size}`}
                      {item.variant?.color && ` • Color: ${item.variant.color}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Update Form */}
        <div>
          <ProductionStageUpdateForm 
            orderId={order.id}
            currentStages={order.production_stages as OrderWithItems['production_stages']}
            currentEstimate={order.production_completion_estimate || undefined}
            qcPhotoUrl={order.qc_photo_url || undefined}
          />
        </div>
      </div>
    </div>
  );
}

import { ShoppingBag, CreditCard } from 'lucide-react';
import { type OrderWithItems, type OrderStatus } from '@/types/order';
import StatusBadge from './StatusBadge';
import { formatPrice } from '@/lib/utils';

interface OrderDetailHeaderProps {
  order: OrderWithItems;
}

export default function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
  const orderDate = new Date(order.created_at);

  return (
    <div className="border-b pb-6 space-y-4">
      {/* Order Info */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <p className="text-sm text-gray-600">
          Placed on{' '}
          {orderDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-500">Status</span>
          <StatusBadge status={order.status as OrderStatus} />
        </div>

        {/* Total */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <ShoppingBag className="h-4 w-4" />
            <span>Order Total</span>
          </div>
          <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
        </div>

        {/* Payment Method */}
        {order.billing_address && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <CreditCard className="h-4 w-4" />
              <span>Payment Method</span>
            </div>
            <p className="text-sm text-gray-700">
              {order.billing_address.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

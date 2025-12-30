import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { type OrderWithItems, type OrderStatus } from '@/types/order';
import { formatPrice } from '@/lib/utils';

interface OrderCardProps {
  order: OrderWithItems;
}

export default function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.order_items?.length || 0;
  const orderDate = new Date(order.created_at);

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="block border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Package className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              Order #{order.id.slice(-8).toUpperCase()}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {orderDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
              <StatusBadge status={order.status as OrderStatus} />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {formatPrice(order.total)}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

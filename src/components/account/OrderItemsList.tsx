import Image from 'next/image';
import { type OrderWithItems } from '@/types/order';
import { formatPrice } from '@/lib/utils';

interface OrderItemsListProps {
  order: OrderWithItems;
}

export default function OrderItemsList({ order }: OrderItemsListProps) {
  if (!order.order_items || order.order_items.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-white divide-y">
      {order.order_items.map((item) => (
        <div
          key={item.id}
          className="flex gap-4 p-4"
        >
          {/* Product Image */}
          {item.products?.images && item.products.images[0] && (
            <div className="relative h-20 w-20 flex-shrink-0">
              <Image
                src={item.products.images[0]}
                alt={item.products.name}
                fill
                className="object-cover rounded-md"
                sizes="80px"
              />
            </div>
          )}

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 line-clamp-2">
              {item.products?.name}
            </h3>

            {item.variant && (
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                {item.variant.color && (
                  <span>Color: {item.variant.color}</span>
                )}
                {item.variant.color && item.variant.size && (
                  <span className="text-gray-400">•</span>
                )}
                {item.variant.size && (
                  <span>Size: {item.variant.size}</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Qty: {item.quantity}</span>
                <span className="text-gray-400">•</span>
                <span>{formatPrice(item.price)}</span>
              </div>
              <span className="font-semibold">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

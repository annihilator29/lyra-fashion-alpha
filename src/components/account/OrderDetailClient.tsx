'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/cart-store';
import type { OrderWithItems } from '@/types/order';

interface OrderDetailClientProps {
  order: OrderWithItems;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [isReordering, setIsReordering] = useState(false);

  const handleBackToOrders = () => {
    router.push('/account/orders');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@lyrafashion.com');
  };

  const handleReorder = async () => {
    setIsReordering(true);

    try {
      // Process each order item
      let addedCount = 0;

      for (const item of order.order_items || []) {
        if (!item.products) continue;

        const product = item.products;

        // Create MinimalProduct for cart (price is now in dollars)
        const minimalProduct = {
          id: product.id,
          slug: product.slug,
          category: product.category,
          name: product.name,
          price: item.price, // Use price directly (already in dollars)
          images: product.images || [],
        };

        const variant = item.variant ? {
          size: item.variant.size || 'M',
          color: item.variant.color || 'Natural',
        } : {
          size: 'M',
          color: 'Natural',
        };

        // Add item to cart with specified quantity
        for (let i = 0; i < item.quantity; i++) {
          addItem(minimalProduct, variant, item.price);
          addedCount++;
        }
      }

      if (addedCount === 0) {
        toast.error('No items found in this order');
        return;
      }

      toast.success(`${addedCount} item${addedCount > 1 ? 's' : ''} added to cart`);
    } catch (error) {
      toast.error('Failed to reorder items. Please try again.');
      console.error('Reorder error:', error);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div>
      {/* Error State Button */}
      <Button
        onClick={handleBackToOrders}
        className="mt-4"
      >
        Back to Orders
      </Button>

      {/* Order Actions */}
      <div className="space-y-3 mt-8">
        <Button
          onClick={handleReorder}
          className="w-full"
          disabled={isReordering}
        >
          {isReordering ? 'Adding to Cart...' : 'Order Again'}
        </Button>
        <Button
          variant="outline"
          onClick={handleContactSupport}
          className="w-full"
        >
          Contact Support
        </Button>
      </div>
    </div>
  );
}

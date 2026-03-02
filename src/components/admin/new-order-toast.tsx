/**
 * New Order Toast Component
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC2: Real-Time Order Updates - Toast Notifications
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderRealtimeData } from '@/lib/supabase/realtime';

interface NewOrderToastProps {
  order: OrderRealtimeData;
  onView: () => void;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 5000; // 5 seconds as per spec

export function NewOrderToast({ order, onView, onDismiss }: NewOrderToastProps) {
  const [progress, setProgress] = useState(100);

  // Format currency
  const formatCurrency = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Get customer display name
  const getCustomerName = (): string => {
    if (order.shipping_address && typeof order.shipping_address === 'object') {
      const addr = order.shipping_address as { name?: string };
      if (addr.name) return addr.name;
    }
    return order.customer_email || 'Unknown Customer';
  };

  // Auto-dismiss with progress
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + AUTO_DISMISS_MS;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / AUTO_DISMISS_MS) * 100;
      setProgress(newProgress);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        onDismiss();
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'relative w-80 overflow-hidden rounded-lg border bg-card shadow-lg',
        'animate-in slide-in-from-right fade-in duration-300'
      )}
      data-testid="new-order-toast"
      role="alert"
    >
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
        data-testid="toast-progress"
      />

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-600">
              New order received!
            </p>
            <p className="mt-1 text-sm font-medium">
              Order #{order.id.slice(0, 8)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(order.total)} from {getCustomerName()}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={onView}
            className="h-7 gap-1 text-xs"
            data-testid="view-order-button"
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

interface NewOrderToastContainerProps {
  orders: OrderRealtimeData[];
  onViewOrder: (orderId: string) => void;
  onDismissOrder: (orderId: string) => void;
}

/**
 * Container for multiple new order toasts
 * Max 3 toasts visible at once as per spec
 */
export function NewOrderToastContainer({
  orders,
  onViewOrder,
  onDismissOrder,
}: NewOrderToastContainerProps) {
  // Limit to 3 toasts max
  const visibleOrders = orders.slice(0, 3);

  if (visibleOrders.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      data-testid="toast-container"
    >
      {visibleOrders.map((order) => (
        <NewOrderToast
          key={order.id}
          order={order}
          onView={() => onViewOrder(order.id)}
          onDismiss={() => onDismissOrder(order.id)}
        />
      ))}
    </div>
  );
}

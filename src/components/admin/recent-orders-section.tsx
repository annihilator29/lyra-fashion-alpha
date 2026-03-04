/**
 * Recent Orders Section
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * Client component for real-time recent orders display
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RecentOrdersTable } from './recent-orders-table';
import { ConnectionStatus } from './connection-status';
import { NewOrderToastContainer } from './new-order-toast';
import { useConnectionStatus } from '@/hooks/use-connection-status';
import { useRealtimeOrders } from '@/hooks/use-realtime-orders';
import { usePollingOrders } from '@/hooks/use-polling-orders';
import { updateOrderStatus } from '@/app/admin/actions';
import type { Order } from '@/types/database.types';
import type { OrderStatus } from '@/types/order';

interface RecentOrdersSectionProps {
  initialOrders: Order[];
}

export function RecentOrdersSection({ initialOrders }: RecentOrdersSectionProps) {
  const router = useRouter();
  const [dismissedToasts, setDismissedToasts] = useState<Set<string>>(new Set());

  // Connection status monitoring
  const { status: connectionStatus } = useConnectionStatus();

  // Real-time orders subscription
  const {
    orders: realtimeOrders,
    newOrders: realtimeNewOrders,
  } = useRealtimeOrders(initialOrders, connectionStatus === 'connected');

  // Polling fallback
  const {
    orders: polledOrders,
    isLoading: isPollingLoading,
    lastPolled,
    refresh: refreshPolling,
  } = usePollingOrders(connectionStatus !== 'connected', 10);

  // Use realtime orders when connected, polled orders otherwise
  const displayOrders = connectionStatus === 'connected' ? realtimeOrders : polledOrders;

  // Filter out dismissed toasts
  const visibleNewOrders = realtimeNewOrders.filter(
    (order) => !dismissedToasts.has(order.id)
  );

  // Handle status change
  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        const result = await updateOrderStatus(orderId, newStatus);

        if (result.success) {
          toast.success(`Order #${orderId.slice(0, 8)} updated to ${newStatus}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update order status');
          throw new Error(result.error);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Update failed';
        toast.error(message);
        throw error;
      }
    },
    [router]
  );

  // Handle view order from toast
  const handleViewOrder = useCallback(
    (orderId: string) => {
      setDismissedToasts((prev) => new Set(prev).add(orderId));
      router.push(`/admin/orders/${orderId}`);
    },
    [router]
  );

  // Handle dismiss toast
  const handleDismissToast = useCallback((orderId: string) => {
    setDismissedToasts((prev) => new Set(prev).add(orderId));
  }, []);

  // Show toast for new realtime orders
  useEffect(() => {
    if (realtimeNewOrders.length > 0) {
      const latestOrder = realtimeNewOrders[0];
      if (!dismissedToasts.has(latestOrder.id)) {
        toast.success('New order received!', {
          description: `Order #${latestOrder.id.slice(0, 8)}`,
        });
      }
    }
  }, [realtimeNewOrders, dismissedToasts]);

  return (
    <div className="space-y-4" data-testid="recent-orders-section">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <ConnectionStatus
          status={connectionStatus}
          onRefresh={refreshPolling}
          lastUpdated={lastPolled}
        />
      </div>

      {/* Orders table */}
      <RecentOrdersTable
        orders={displayOrders}
        onStatusChange={handleStatusChange}
        isLoading={isPollingLoading && connectionStatus !== 'connected'}
      />

      {/* Toast notifications */}
      <NewOrderToastContainer
        orders={visibleNewOrders}
        onViewOrder={handleViewOrder}
        onDismissOrder={handleDismissToast}
      />
    </div>
  );
}

export default RecentOrdersSection;

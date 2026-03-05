/**
 * Orders Realtime Provider
 * Story 7.3: Order Management & Fulfillment Tools
 * Phase 6: Real-Time Updates
 * 
 * Supabase Realtime integration for live order updates:
 * - Subscribe to order changes
 * - Show toast notifications for new orders
 * - Auto-refresh order status
 * - Dashboard alerts integration
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';
import type { OrderWithItems } from '@/types/order';

interface OrdersRealtimeContextType {
  isConnected: boolean;
  newOrdersCount: number;
  recentChanges: OrderChange[];
  subscribeToOrders: () => void;
  unsubscribeFromOrders: () => void;
}

interface OrderChange {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  order: OrderWithItems;
  timestamp: Date;
}

const OrdersRealtimeContext = createContext<OrdersRealtimeContextType | undefined>(undefined);

export function OrdersRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [recentChanges, setRecentChanges] = useState<OrderChange[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const subscribeToOrders = useCallback(() => {
    const supabase = createClient();

    const newChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const change: OrderChange = {
            type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            order: payload.new as OrderWithItems,
            timestamp: new Date(),
          };

          // Add to recent changes
          setRecentChanges((prev) => [change, ...prev].slice(0, 10));

          // Handle new orders
          if (payload.eventType === 'INSERT') {
            setNewOrdersCount((prev) => prev + 1);
            
            // Show toast notification
            const orderNumber = (payload.new as OrderWithItems).order_number || 'New Order';
            toast.success('📦 New Order Received', {
              description: `Order ${orderNumber} has been placed`,
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  window.location.href = `/admin/orders/${(payload.new as OrderWithItems).id}`;
                },
              },
            });

            // Play notification sound (optional)
            playNotificationSound();
          }

          // Handle status updates
          if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as OrderWithItems)?.status;
            const newStatus = (payload.new as OrderWithItems)?.status;
            
            if (oldStatus !== newStatus) {
              const orderNumber = (payload.new as OrderWithItems).order_number || 'Order';
              toast.info('Order Status Updated', {
                description: `Order ${orderNumber}: ${oldStatus} → ${newStatus}`,
                duration: 3000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('[Realtime] Subscribed to orders channel');
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          console.error('[Realtime] Error subscribing to orders channel');
        }
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, []);

  const unsubscribeFromOrders = useCallback(() => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
      setIsConnected(false);
      console.log('[Realtime] Unsubscribed from orders channel');
    }
  }, [channel]);

  // Auto-subscribe on mount
  useEffect(() => {
    subscribeToOrders();

    return () => {
      unsubscribeFromOrders();
    };
  }, [subscribeToOrders, unsubscribeFromOrders]);

  // Reset new orders count when viewing orders page
  useEffect(() => {
    const handleReset = () => {
      setNewOrdersCount(0);
    };

    window.addEventListener('orders-viewed', handleReset);
    return () => window.removeEventListener('orders-viewed', handleReset);
  }, []);

  return (
    <OrdersRealtimeContext.Provider
      value={{
        isConnected,
        newOrdersCount,
        recentChanges,
        subscribeToOrders,
        unsubscribeFromOrders,
      }}
    >
      {children}
    </OrdersRealtimeContext.Provider>
  );
}

export function useOrdersRealtime() {
  const context = useContext(OrdersRealtimeContext);
  if (context === undefined) {
    throw new Error('useOrdersRealtime must be used within an OrdersRealtimeProvider');
  }
  return context;
}

/**
 * Play notification sound for new orders
 */
function playNotificationSound() {
  // Optional: Add notification sound
  // const audio = new Audio('/sounds/notification.mp3');
  // audio.play().catch(() => {}); // Ignore errors
}

/**
 * Realtime Orders Badge Component
 * Shows count of new orders since page load
 */
export function NewOrdersBadge() {
  const { newOrdersCount, isConnected } = useOrdersRealtime();

  if (!isConnected || newOrdersCount === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
      {newOrdersCount}
    </span>
  );
}

/**
 * Realtime Connection Status Component
 */
export function RealtimeConnectionStatus() {
  const { isConnected } = useOrdersRealtime();

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-muted-foreground">
        {isConnected ? 'Live Updates' : 'Disconnected'}
      </span>
    </div>
  );
}

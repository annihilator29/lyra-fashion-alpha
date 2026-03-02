/**
 * Real-Time Orders Hook
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC2: Real-Time Order Updates
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeToOrders,
  subscribeToNewOrders,
  type OrderRealtimePayload,
  type OrderRealtimeData,
} from '@/lib/supabase/realtime';
import type { Order } from '@/types/database.types';

interface UseRealtimeOrdersReturn {
  orders: Order[];
  newOrders: OrderRealtimeData[];
  isConnected: boolean;
  lastUpdate: Date | null;
}

// Debounce time for rapid updates (300ms as per spec)
const DEBOUNCE_MS = 300;

/**
 * Hook to subscribe to real-time order updates
 * Returns current orders and new orders for toast notifications
 */
export function useRealtimeOrders(
  initialOrders: Order[] = [],
  isRealtimeEnabled: boolean = true
): UseRealtimeOrdersReturn {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [newOrders, setNewOrders] = useState<OrderRealtimeData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<OrderRealtimeData[]>([]);

  /**
   * Process pending updates with debouncing
   */
  const processPendingUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.length === 0) return;

    setNewOrders((prev) => {
      const combined = [...pendingUpdatesRef.current, ...prev];
      // Keep max 3 new orders for toast queue
      return combined.slice(0, 3);
    });

    setOrders((prev) => {
      const newOrdersList = pendingUpdatesRef.current.map(o => o as Order);
      const combined = [...newOrdersList, ...prev];
      // Keep only 10 most recent orders
      return combined.slice(0, 10);
    });

    setLastUpdate(new Date());
    pendingUpdatesRef.current = [];
  }, []);

  /**
   * Handle new order from realtime
   */
  const handleNewOrder = useCallback(
    (order: OrderRealtimeData) => {
      pendingUpdatesRef.current.push(order);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        processPendingUpdates();
      }, DEBOUNCE_MS);
    },
    [processPendingUpdates]
  );

  /**
   * Handle order updates (status changes, etc.)
   */
  const handleOrderUpdate = useCallback((payload: OrderRealtimePayload) => {
    if (payload.eventType === 'UPDATE' && payload.new) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === payload.new?.id ? (payload.new as Order) : order
        )
      );
      setLastUpdate(new Date());
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isRealtimeEnabled) {
      setIsConnected(false);
      return;
    }

    let unsubscribeNewOrders: (() => void) | null = null;
    let unsubscribeUpdates: (() => void) | null = null;

    try {
      // Subscribe to new orders
      unsubscribeNewOrders = subscribeToNewOrders((order) => {
        setIsConnected(true);
        handleNewOrder(order);
      });

      // Subscribe to all order changes
      unsubscribeUpdates = subscribeToOrders((payload) => {
        setIsConnected(true);
        handleOrderUpdate(payload);
      });
    } catch (error) {
      console.error('[useRealtimeOrders] Subscription error:', error);
      setIsConnected(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      unsubscribeNewOrders?.();
      unsubscribeUpdates?.();
    };
  }, [isRealtimeEnabled, handleNewOrder, handleOrderUpdate]);

  return {
    orders,
    newOrders,
    isConnected,
    lastUpdate,
  };
}

/**
 * Hook to subscribe to new orders only (for toast notifications)
 */
export function useNewOrderNotifications(
  onNewOrder: (order: OrderRealtimeData) => void,
  isRealtimeEnabled: boolean = true
): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isRealtimeEnabled) {
      setIsConnected(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = subscribeToNewOrders((order) => {
        setIsConnected(true);
        onNewOrder(order);
      });
    } catch (error) {
      console.error('[useNewOrderNotifications] Subscription error:', error);
      setIsConnected(false);
    }

    return () => {
      unsubscribe?.();
    };
  }, [isRealtimeEnabled, onNewOrder]);

  return { isConnected };
}

export default useRealtimeOrders;

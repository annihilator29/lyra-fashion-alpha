/**
 * Real-Time Metrics Hook
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC3: Real-Time Metric Updates
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToOrderStatusChanges } from '@/lib/supabase/realtime';
import type { OrderRealtimeData } from '@/lib/supabase/realtime';
import type { Order } from '@/types/database.types';

interface MetricUpdates {
  todaysRevenue?: boolean;
  orderCounts?: boolean;
  newOrders?: boolean;
}

interface UseRealtimeMetricsReturn {
  pendingUpdates: MetricUpdates;
  isConnected: boolean;
  lastUpdate: Date | null;
  clearPendingUpdates: () => void;
}

// Throttle time for metric updates (max 1 update per 5 seconds as per spec)
const THROTTLE_MS = 5000;

/**
 * Hook to track which metrics need updating based on realtime events
 * Uses throttling to prevent excessive updates
 */
export function useRealtimeMetrics(
  onMetricsNeedUpdate: (updates: MetricUpdates) => void,
  isRealtimeEnabled: boolean = true
): UseRealtimeMetricsReturn {
  const [pendingUpdates, setPendingUpdates] = useState<MetricUpdates>({});
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedUpdatesRef = useRef<MetricUpdates>({});

  /**
   * Process accumulated updates after throttle period
   */
  const processAccumulatedUpdates = useCallback(() => {
    if (Object.keys(accumulatedUpdatesRef.current).length === 0) return;

    const updates = { ...accumulatedUpdatesRef.current };

    setPendingUpdates(updates);
    onMetricsNeedUpdate(updates);
    setLastUpdate(new Date());

    accumulatedUpdatesRef.current = {};
  }, [onMetricsNeedUpdate]);

  /**
   * Queue an update with throttling
   */
  const queueUpdate = useCallback(
    (updateType: keyof MetricUpdates) => {
      accumulatedUpdatesRef.current[updateType] = true;

      // If no timer is running, start one
      if (!throttleTimerRef.current) {
        throttleTimerRef.current = setTimeout(() => {
          processAccumulatedUpdates();
          throttleTimerRef.current = null;
        }, THROTTLE_MS);
      }
    },
    [processAccumulatedUpdates]
  );

  /**
   * Handle order status change
   */
  const handleStatusChange = useCallback(
    (order: OrderRealtimeData, oldStatus: string | null) => {
      // Always update order counts on any status change
      queueUpdate('orderCounts');
      queueUpdate('newOrders');

      // Update revenue only if order is from today and not excluded
      const isToday = (dateString: string): boolean => {
        const date = new Date(dateString);
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      };

      if (
        order.created_at &&
        isToday(order.created_at) &&
        !['cancelled', 'refunded'].includes(order.status)
      ) {
        queueUpdate('todaysRevenue');
      }
    },
    [queueUpdate]
  );

  // Subscribe to status changes
  useEffect(() => {
    if (!isRealtimeEnabled) {
      setIsConnected(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = subscribeToOrderStatusChanges((order, oldStatus) => {
        setIsConnected(true);
        handleStatusChange(order, oldStatus);
      });
    } catch (error) {
      console.error('[useRealtimeMetrics] Subscription error:', error);
      setIsConnected(false);
    }

    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      unsubscribe?.();
    };
  }, [isRealtimeEnabled, handleStatusChange]);

  /**
   * Clear pending updates after they've been processed
   */
  const clearPendingUpdates = useCallback(() => {
    setPendingUpdates({});
    accumulatedUpdatesRef.current = {};
  }, []);

  return {
    pendingUpdates,
    isConnected,
    lastUpdate,
    clearPendingUpdates,
  };
}

export default useRealtimeMetrics;

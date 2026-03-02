/**
 * Polling Orders Hook
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC4: Real-Time Fallback Strategy - Polling Implementation
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Order } from '@/types/database.types';

interface UsePollingOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  lastPolled: Date | null;
  lastOrderId: string | null;
  hasNewOrders: boolean;
  refresh: () => Promise<void>;
}

const POLLING_INTERVAL_MS = 30000; // 30 seconds as per spec

/**
 * Hook to poll for recent orders when realtime is unavailable
 */
export function usePollingOrders(
  enabled: boolean = true,
  limit: number = 10
): UsePollingOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [hasNewOrders, setHasNewOrders] = useState(false);

  const previousOrdersRef = useRef<Order[]>([]);

  /**
   * Fetch recent orders from API
   */
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = new URL('/api/admin/orders/recent', window.location.origin);
      url.searchParams.set('limit', limit.toString());

      // If we have a lastOrderId, fetch only orders newer than that
      if (lastOrderId) {
        url.searchParams.set('since', lastOrderId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const newOrders: Order[] = data.orders || [];

      // Detect if there are new orders
      if (previousOrdersRef.current.length > 0 && newOrders.length > 0) {
        const prevTopId = previousOrdersRef.current[0]?.id;
        const newTopId = newOrders[0]?.id;
        setHasNewOrders(newTopId !== prevTopId);
      }

      previousOrdersRef.current = newOrders;
      setOrders(newOrders);

      if (newOrders.length > 0) {
        setLastOrderId(newOrders[0].id);
      }

      setLastPolled(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      console.error('[usePollingOrders] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit, lastOrderId]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    setHasNewOrders(false);
    await fetchOrders();
  }, [fetchOrders]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, fetchOrders]);

  // Reset hasNewOrders after a short delay
  useEffect(() => {
    if (hasNewOrders) {
      const timer = setTimeout(() => {
        setHasNewOrders(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasNewOrders]);

  return {
    orders,
    isLoading,
    error,
    lastPolled,
    lastOrderId,
    hasNewOrders,
    refresh,
  };
}

/**
 * Hook to track if new orders are available without fetching full data
 * Useful for showing "new orders available" indicator
 */
export function useOrderAvailabilityCheck(
  enabled: boolean = true,
  lastKnownOrderId: string | null = null
): { hasNewOrders: boolean; checkForNewOrders: () => Promise<void> } {
  const [hasNewOrders, setHasNewOrders] = useState(false);

  const checkForNewOrders = useCallback(async () => {
    try {
      const url = new URL('/api/admin/orders/recent', window.location.origin);
      url.searchParams.set('limit', '1');

      const response = await fetch(url.toString());

      if (!response.ok) return;

      const data = await response.json();
      const orders: Order[] = data.orders || [];

      if (orders.length > 0 && lastKnownOrderId) {
        setHasNewOrders(orders[0].id !== lastKnownOrderId);
      } else if (orders.length > 0 && !lastKnownOrderId) {
        setHasNewOrders(true);
      }
    } catch (err) {
      console.error('[useOrderAvailabilityCheck] Error:', err);
    }
  }, [lastKnownOrderId]);

  useEffect(() => {
    if (!enabled) return;

    checkForNewOrders();

    const interval = setInterval(() => {
      checkForNewOrders();
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, checkForNewOrders]);

  return { hasNewOrders, checkForNewOrders };
}

export default usePollingOrders;

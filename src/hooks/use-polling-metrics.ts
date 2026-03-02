/**
 * Polling Metrics Hook
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC4: Real-Time Fallback Strategy - Polling Implementation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface DashboardMetrics {
  todaysRevenue: number;
  newOrders: number;
  processingOrders: number;
  shippedOrders: number;
  newSignups: number;
  activeUsers: number;
}

interface MetricChanges {
  todaysRevenue: boolean;
  newOrders: boolean;
  processingOrders: boolean;
  shippedOrders: boolean;
  newSignups: boolean;
  activeUsers: boolean;
}

interface UsePollingMetricsReturn {
  metrics: DashboardMetrics | null;
  changes: MetricChanges;
  isLoading: boolean;
  error: string | null;
  lastPolled: Date | null;
  refresh: () => Promise<void>;
}

const POLLING_INTERVAL_MS = 60000; // 60 seconds as per spec

const defaultMetrics: DashboardMetrics = {
  todaysRevenue: 0,
  newOrders: 0,
  processingOrders: 0,
  shippedOrders: 0,
  newSignups: 0,
  activeUsers: 0,
};

const defaultChanges: MetricChanges = {
  todaysRevenue: false,
  newOrders: false,
  processingOrders: false,
  shippedOrders: false,
  newSignups: false,
  activeUsers: false,
};

/**
 * Hook to poll for dashboard metrics when realtime is unavailable
 */
export function usePollingMetrics(
  enabled: boolean = true
): UsePollingMetricsReturn {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [changes, setChanges] = useState<MetricChanges>(defaultChanges);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);

  /**
   * Fetch current metrics from API
   */
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/metrics/current');

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const newMetrics: DashboardMetrics = {
        todaysRevenue: data.todaysRevenue || 0,
        newOrders: data.newOrders || 0,
        processingOrders: data.processingOrders || 0,
        shippedOrders: data.shippedOrders || 0,
        newSignups: data.newSignups || 0,
        activeUsers: data.activeUsers || 0,
      };

      // Detect changes by comparing with previous metrics
      if (metrics) {
        const newChanges: MetricChanges = {
          todaysRevenue: newMetrics.todaysRevenue !== metrics.todaysRevenue,
          newOrders: newMetrics.newOrders !== metrics.newOrders,
          processingOrders:
            newMetrics.processingOrders !== metrics.processingOrders,
          shippedOrders: newMetrics.shippedOrders !== metrics.shippedOrders,
          newSignups: newMetrics.newSignups !== metrics.newSignups,
          activeUsers: newMetrics.activeUsers !== metrics.activeUsers,
        };
        setChanges(newChanges);
      }

      setMetrics(newMetrics);
      setLastPolled(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      console.error('[usePollingMetrics] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [metrics]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchMetrics();

    const interval = setInterval(() => {
      fetchMetrics();
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, fetchMetrics]);

  // Reset changes after a short delay
  useEffect(() => {
    const hasChanges = Object.values(changes).some(Boolean);
    if (hasChanges) {
      const timer = setTimeout(() => {
        setChanges(defaultChanges);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [changes]);

  return {
    metrics: metrics || defaultMetrics,
    changes,
    isLoading,
    error,
    lastPolled,
    refresh,
  };
}

export default usePollingMetrics;

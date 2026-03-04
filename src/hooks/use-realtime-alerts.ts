/**
 * useRealtimeAlerts Hook
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 * AC6: Real-time alert updates via Supabase Realtime subscriptions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getLowInventoryProducts,
  getPendingReturns,
  getOpenSupportTickets,
  getFailedPaymentOrders,
} from '@/app/admin/actions';
import { Alert } from '@/components/admin/alerts-section';
import { AlertPriority } from '@/lib/alerts/priority';
import { ALERT_REALTIME_ENABLED, ALERT_POLLING_INTERVAL } from '@/lib/config/alerts';

// Type definitions for alert data
interface LowInventoryProduct {
  id: string;
  name: string;
  quantity: number;
}

interface PendingReturn {
  id: string;
  order_id: string;
  customer_name: string;
  request_date: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  created_at: string;
  customer_name: string;
}

interface FailedPaymentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  failure_date: string;
  payment_error_message?: string;
}

interface AlertData {
  lowInventory: { products: LowInventoryProduct[]; error?: string };
  pendingReturns: { returns: PendingReturn[]; error?: string };
  failedPayments: { orders: FailedPaymentOrder[]; error?: string };
  supportTickets: { tickets: SupportTicket[]; error?: string; supported: boolean };
}

// Debounce function for rapid updates
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState<string[]>([]);

  // Transform alert data into Alert objects
  const transformAlerts = useCallback((data: AlertData): Alert[] => {
    const result: Alert[] = [];

    // Low Inventory Alert
    if (data.lowInventory.products.length > 0) {
      const hasZeroStock = data.lowInventory.products.some(
        (p) => p.quantity === 0
      );
      result.push({
        id: 'low-inventory',
        type: 'low-inventory',
        count: data.lowInventory.products.length,
        priority: (hasZeroStock ? 'high' : 'medium') as AlertPriority,
        items: data.lowInventory.products.slice(0, 3).map((p) => ({
          id: p.id,
          title: p.name,
          meta: `Quantity: ${p.quantity}`,
        })),
        actionLink: '/admin/inventory',
        actionLabel: 'Manage Inventory',
      });
    }

    // Pending Returns Alert
    if (data.pendingReturns.returns.length > 0) {
      result.push({
        id: 'pending-returns',
        type: 'pending-returns',
        count: data.pendingReturns.returns.length,
        priority: 'medium',
        items: data.pendingReturns.returns.slice(0, 3).map((r) => ({
          id: r.id,
          title: `Order #${r.order_id?.substring(0, 8) || 'Unknown'}`,
          subtitle: r.customer_name,
          meta: new Date(r.request_date).toLocaleDateString(),
        })),
        actionLink: '/admin/returns',
        actionLabel: 'Review Returns',
      });
    }

    // Support Tickets Alert (if supported)
    if (data.supportTickets.supported && data.supportTickets.tickets.length > 0) {
      const hasOldTickets = data.supportTickets.tickets.some(
        (t) =>
          Date.now() - new Date(t.created_at).getTime() > 24 * 60 * 60 * 1000
      );
      result.push({
        id: 'support-tickets',
        type: 'support-tickets',
        count: data.supportTickets.tickets.length,
        priority: (hasOldTickets ? 'high' : 'medium') as AlertPriority,
        items: data.supportTickets.tickets.slice(0, 3).map((t) => ({
          id: t.id,
          title: t.subject,
          subtitle: t.customer_name,
          meta: new Date(t.created_at).toLocaleDateString(),
        })),
        actionLink: '/admin/support',
        actionLabel: 'View Tickets',
      });
    }

    // Failed Payments Alert
    if (data.failedPayments.orders.length > 0) {
      result.push({
        id: 'failed-payments',
        type: 'failed-payments',
        count: data.failedPayments.orders.length,
        priority: 'high',
        // AC4: Include payment_error_message when available
        items: data.failedPayments.orders.slice(0, 3).map((o) => ({
          id: o.id,
          title: `Order #${o.order_number}`,
          subtitle: o.customer_name,
          meta: o.payment_error_message 
            ? `Error: ${o.payment_error_message.substring(0, 50)}${o.payment_error_message.length > 50 ? '...' : ''}`
            : `Failed: ${new Date(o.failure_date).toLocaleDateString()}`,
        })),
        actionLink: '/admin/orders?status=payment_failed',
        actionLabel: 'Review Orders',
      });
    }

    return result;
  }, []);

  // Load all alerts
  const loadAllAlerts = useCallback(async () => {
    try {
      const [lowInventory, pendingReturns, supportTickets, failedPayments] =
        await Promise.all([
          getLowInventoryProducts(),
          getPendingReturns(),
          getOpenSupportTickets(),
          getFailedPaymentOrders(),
        ]);

      const data: AlertData = {
        lowInventory,
        pendingReturns,
        supportTickets,
        failedPayments,
      };

      const newAlerts = transformAlerts(data);
      
      // AC6: Detect which alerts changed for pulse effect
      const currentAlertIds = new Set(alerts.map(a => `${a.id}-${a.count}`));
      const changedAlertIds = newAlerts
        .filter(a => !currentAlertIds.has(`${a.id}-${a.count}`) && !isLoading)
        .map(a => a.id);
      
      if (changedAlertIds.length > 0) {
        setRecentlyUpdatedIds(changedAlertIds);
        // Clear pulse effect after 3 seconds
        setTimeout(() => setRecentlyUpdatedIds([]), 3000);
      }
      
      setAlerts(newAlerts);
      setError(null);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, [transformAlerts, alerts, isLoading]);

  // Initial load and realtime subscriptions
  useEffect(() => {
    // Initial load
    loadAllAlerts();

    // If realtime disabled, use polling
    if (!ALERT_REALTIME_ENABLED) {
      const interval = setInterval(loadAllAlerts, ALERT_POLLING_INTERVAL);
      return () => clearInterval(interval);
    }

    // Setup realtime subscriptions
    const supabase = createClient();

    // Debounced refresh for rapid updates
    const debouncedRefresh = debounce(() => loadAllAlerts(), 500);

    // Subscribe to inventory changes
    const inventoryChannel = supabase
      .channel('alerts-inventory')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inventory' },
        debouncedRefresh
      )
      .subscribe();

    // Subscribe to returns changes
    const returnsChannel = supabase
      .channel('alerts-returns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'returns' },
        debouncedRefresh
      )
      .subscribe();

    // Subscribe to order payment status changes
    const ordersChannel = supabase
      .channel('alerts-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'status=eq.payment_failed',
        },
        debouncedRefresh
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(returnsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [loadAllAlerts]);

  return { 
    alerts, 
    isLoading, 
    error, 
    refreshAlerts: loadAllAlerts,
    recentlyUpdatedAlertIds: recentlyUpdatedIds // AC6: For pulse effect
  };
}

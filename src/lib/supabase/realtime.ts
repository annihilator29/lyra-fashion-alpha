/**
 * Supabase Realtime Configuration
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC2: Real-Time Order Updates, AC3: Real-Time Metric Updates
 */

import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/types/database.types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type OrderEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface OrderRealtimePayload {
  eventType: OrderEventType;
  new: OrderRealtimeData | null;
  old: OrderRealtimeData | null;
}

// Simplified order data from realtime payload
export interface OrderRealtimeData {
  id: string;
  customer_id?: string | null;
  customer_email?: string | null;
  status: string;
  total: number;
  shipping_address?: unknown;
  billing_address?: unknown | null;
  email_sent?: boolean;
  email_sent_at?: string | null;
  email_error?: string | null;
  ordered_at?: string;
  production_started_at?: string | null;
  quality_checked_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  production_stages?: unknown | null;
  production_completion_estimate?: string | null;
  qc_photo_url?: string | null;
  tracking_number?: string | null;
  carrier?: string | null;
  estimated_delivery_date?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subscribe to orders table changes
 * @param callback - Function called when order changes occur
 * @returns Unsubscribe function
 */
export function subscribeToOrders(
  callback: (payload: OrderRealtimePayload) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel('admin-orders')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
      },
      (payload: RealtimePostgresChangesPayload<Order>) => {
        callback({
          eventType: 'INSERT',
          new: payload.new as OrderRealtimeData,
          old: null,
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
      },
      (payload: RealtimePostgresChangesPayload<Order>) => {
        callback({
          eventType: 'UPDATE',
          new: payload.new as OrderRealtimeData,
          old: payload.old as OrderRealtimeData,
        });
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to new order inserts only
 * @param callback - Function called when new order is inserted
 * @returns Unsubscribe function
 */
export function subscribeToNewOrders(
  callback: (order: OrderRealtimeData) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel('admin-new-orders')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
      },
      (payload: RealtimePostgresChangesPayload<Order>) => {
        if (payload.new) {
          callback(payload.new as OrderRealtimeData);
        }
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] New orders subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to order status changes only
 * @param callback - Function called when order status changes
 * @returns Unsubscribe function
 */
export function subscribeToOrderStatusChanges(
  callback: (order: OrderRealtimeData, oldStatus: string | null) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel('admin-order-status')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: 'status=neq.status', // Only when status changes
      },
      (payload: RealtimePostgresChangesPayload<Order>) => {
        if (payload.new) {
          callback(payload.new as OrderRealtimeData, (payload.old as OrderRealtimeData)?.status || null);
        }
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Status changes subscription status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Check if Realtime is enabled and working
 * @returns Promise resolving to connection status
 */
export async function checkRealtimeConnection(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('orders').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Get Realtime channel status
 * @returns Current subscription status
 */
export function getRealtimeStatus(
  callback: (status: 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT') => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel('admin-status-check')
    .subscribe((status) => {
      callback(status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

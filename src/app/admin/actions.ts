/**
 * Admin Analytics Server Actions
 * Story 7.1a: Admin Dashboard - Foundation
 * AC3: Key Metrics Display (Static)
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

export interface TodaysRevenueResult {
  amount: number;
  error?: string;
}

export interface OrderCountsResult {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  error?: string;
}

export interface NewSignupsResult {
  count: number;
  error?: string;
}

export interface ActiveUsersResult {
  count: number;
  error?: string;
}

/**
 * Get today's revenue from non-cancelled/refunded orders
 * Returns amount in cents (divide by 100 for dollars)
 */
export async function getTodaysRevenue(): Promise<TodaysRevenueResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const today = new Date().toISOString().split('T')[0];

    // Query orders directly - excludes cancelled and refunded orders
    const { data: orders, error: queryError } = await supabase
      .from('orders')
      .select('total')
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .not('status', 'in', '(cancelled,refunded)');

    if (queryError) {
      console.error('getTodaysRevenue - Error:', JSON.stringify(queryError, null, 2));
      return { amount: 0, error: queryError.message || JSON.stringify(queryError) };
    }

    const total = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    return { amount: total };
  } catch (error) {
    console.error('getTodaysRevenue - Catch Error:', JSON.stringify(error, null, 2));
    return { amount: 0, error: error instanceof Error ? error.message : 'Failed to fetch revenue' };
  }
}

/**
 * Get order counts grouped by status for today
 */
export async function getOrderCountsByStatus(): Promise<OrderCountsResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    if (error) {
      console.error('getOrderCountsByStatus - Error:', JSON.stringify(error, null, 2));
      return {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        error: error.message || JSON.stringify(error),
      };
    }

    const counts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };

    data?.forEach((order) => {
      if (order.status in counts) {
        counts[order.status as keyof typeof counts]++;
      }
    });

    return counts;
  } catch (error) {
    console.error('getOrderCountsByStatus - Catch Error:', JSON.stringify(error, null, 2));
    return {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch order counts',
    };
  }
}

/**
 * Get count of new signups today
 */
export async function getTodaysNewSignups(): Promise<NewSignupsResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const today = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    if (error) {
      console.error('getTodaysNewSignups - Error:', JSON.stringify(error, null, 2));
      return { count: 0, error: error.message || JSON.stringify(error) };
    }

    return { count: count || 0 };
  } catch (error) {
    console.error('getTodaysNewSignups - Catch Error:', JSON.stringify(error, null, 2));
    return { count: 0, error: error instanceof Error ? error.message : 'Failed to fetch new signups' };
  }
}

/**
 * Get count of active users (logged in within last 30 days)
 */
export async function getActiveUserCount(): Promise<ActiveUsersResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString();

    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', cutoffDate);

    if (error) {
      console.error('getActiveUserCount - Error:', JSON.stringify(error, null, 2));
      return { count: 0, error: error.message || JSON.stringify(error) };
    }

    return { count: count || 0 };
  } catch (error) {
    console.error('getActiveUserCount - Catch Error:', JSON.stringify(error, null, 2));
    return { count: 0, error: error instanceof Error ? error.message : 'Failed to fetch active users' };
  }
}

/**
 * Get all dashboard metrics in parallel
 */
export async function getDashboardMetrics() {
  try {
    await requireAdmin();

    const [revenue, orderCounts, newSignups, activeUsers] = await Promise.all([
      getTodaysRevenue(),
      getOrderCountsByStatus(),
      getTodaysNewSignups(),
      getActiveUserCount(),
    ]);

    return {
      todaysRevenue: revenue.amount,
      newOrders: orderCounts.pending,
      processingOrders: orderCounts.processing,
      shippedOrders: orderCounts.shipped,
      newSignups: newSignups.count,
      activeUsers: activeUsers.count,
      errors: [
        revenue.error,
        orderCounts.error,
        newSignups.error,
        activeUsers.error,
      ].filter(Boolean),
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      todaysRevenue: 0,
      newOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      newSignups: 0,
      activeUsers: 0,
      errors: ['Failed to fetch dashboard metrics'],
    };
  }
}

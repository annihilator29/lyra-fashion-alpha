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

// ============================================================================
// Story 7.1c: Admin Dashboard - Real-Time Features
// Order Management Server Actions
// ============================================================================

import type { OrderStatus } from '@/types/order';
import { validateStatusTransition } from '@/lib/orders/status-transitions';
import type { Order } from '@/types/database.types';

export interface RecentOrdersResult {
  orders: Order[];
  error?: string;
}

export interface UpdateOrderStatusResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export interface StatusValidationResult {
  valid: boolean;
  warning?: string;
  error?: string;
}

/**
 * Get recent orders with customer info
 * @param limit - Number of orders to return (default: 10)
 * @returns Array of recent orders
 */
export async function getRecentOrders(limit: number = 10): Promise<RecentOrdersResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('getRecentOrders - Error:', JSON.stringify(error, null, 2));
      return { orders: [], error: error.message };
    }

    return { orders: (orders as Order[]) || [] };
  } catch (error) {
    console.error('getRecentOrders - Catch Error:', JSON.stringify(error, null, 2));
    return {
      orders: [],
      error: error instanceof Error ? error.message : 'Failed to fetch recent orders',
    };
  }
}

/**
 * Get orders newer than a specific order ID
 * Used for incremental polling updates
 * @param sinceOrderId - Order ID to fetch orders after
 * @param limit - Maximum orders to return
 */
export async function getOrdersSince(
  sinceOrderId: string,
  limit: number = 10
): Promise<RecentOrdersResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // First get the created_at of the reference order
    const { data: referenceOrder, error: refError } = await supabase
      .from('orders')
      .select('created_at')
      .eq('id', sinceOrderId)
      .single();

    if (refError || !referenceOrder) {
      // If reference order not found, fall back to getRecentOrders
      return getRecentOrders(limit);
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gt('created_at', referenceOrder.created_at)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('getOrdersSince - Error:', JSON.stringify(error, null, 2));
      return { orders: [], error: error.message };
    }

    return { orders: (orders as Order[]) || [] };
  } catch (error) {
    console.error('getOrdersSince - Catch Error:', JSON.stringify(error, null, 2));
    return {
      orders: [],
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
    };
  }
}

/**
 * Update order status
 * Validates status transition before updating
 * @param orderId - Order ID to update
 * @param newStatus - New status to set
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<UpdateOrderStatusResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Get current order status
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status, created_at')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.error('updateOrderStatus - Fetch Error:', JSON.stringify(fetchError, null, 2));
      return {
        success: false,
        error: fetchError?.message || 'Order not found',
      };
    }

    const currentStatus = order.status as OrderStatus;

    // Validate status transition
    const validation = validateStatusTransition(currentStatus, newStatus);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid status transition',
      };
    }

    // Prepare update data
    const updateData: Record<string, string | null> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Add timestamp fields based on status
    if (newStatus === 'production') {
      updateData.production_started_at = new Date().toISOString();
    } else if (newStatus === 'quality_check') {
      updateData.quality_checked_at = new Date().toISOString();
    } else if (newStatus === 'shipped') {
      updateData.shipped_at = new Date().toISOString();
    } else if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    // Perform update
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('updateOrderStatus - Update Error:', JSON.stringify(updateError, null, 2));
      return {
        success: false,
        error: updateError.message,
      };
    }

    console.log(`[Admin] Order ${orderId} status updated: ${currentStatus} -> ${newStatus}`);

    return {
      success: true,
      order: updatedOrder as Order,
    };
  } catch (error) {
    console.error('updateOrderStatus - Catch Error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status',
    };
  }
}

/**
 * Validate a status transition without performing it
 * @param currentStatus - Current order status
 * @param newStatus - Proposed new status
 */
export async function validateStatusTransitionAction(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<StatusValidationResult> {
  try {
    await requireAdmin();

    const validation = validateStatusTransition(currentStatus, newStatus);

    return {
      valid: validation.valid,
      warning: validation.warning,
      error: validation.error,
    };
  } catch (error) {
    console.error('validateStatusTransitionAction - Error:', JSON.stringify(error, null, 2));
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

/**
 * Get single order by ID
 * @param orderId - Order ID to fetch
 */
export async function getOrderById(orderId: string): Promise<{
  order: Order | null;
  error?: string;
}> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('getOrderById - Error:', JSON.stringify(error, null, 2));
      return { order: null, error: error.message };
    }

    return { order: order as Order };
  } catch (error) {
    console.error('getOrderById - Catch Error:', JSON.stringify(error, null, 2));
    return {
      order: null,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    };
  }
}

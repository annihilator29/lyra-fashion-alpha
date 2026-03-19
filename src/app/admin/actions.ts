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

// ============================================================================
// Story 7.1d: Admin Dashboard - Alerts & Notifications
// Alert Data Layer Server Actions
// ============================================================================

import { LOW_INVENTORY_THRESHOLD, getInventoryPriority } from '@/lib/config/alerts';
import {
  getLowInventoryPriority,
  getPendingReturnsPriority,
  getSupportTicketPriority,
  getFailedPaymentsPriority,
  AlertPriority,
} from '@/lib/alerts/priority';

export interface LowInventoryProduct {
  id: string;
  name: string;
  quantity: number;
  priority: AlertPriority;
}

export interface PendingReturn {
  id: string;
  order_id: string;
  customer_name: string;
  request_date: string;
  reason: string;
}

export interface OpenSupportTicket {
  id: string;
  subject: string;
  created_at: string;
  customer_name: string;
  priority: AlertPriority;
}

export interface FailedPaymentOrder {
  id: string;
  order_number: string;
  total: number;
  failure_date: string;
  customer_name: string;
  customer_email: string;
  payment_error_message?: string;
}

export interface AlertCounts {
  lowInventory: { count: number; priority: AlertPriority };
  pendingReturns: { count: number; priority: AlertPriority };
  supportTickets: { count: number; priority: AlertPriority };
  failedPayments: { count: number; priority: AlertPriority };
}

/**
 * Get products with low inventory (quantity < threshold)
 * @param threshold - Low inventory threshold (default: LOW_INVENTORY_THRESHOLD env var)
 * @returns Array of products below threshold with priority
 */
export async function getLowInventoryProducts(
  threshold: number = LOW_INVENTORY_THRESHOLD
): Promise<{ products: LowInventoryProduct[]; error?: string }> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, inventory!inner(quantity)')
      .lt('inventory.quantity', threshold)
      .order('quantity', { foreignTable: 'inventory', ascending: true })
      .limit(10);

    if (error) {
      console.error('getLowInventoryProducts - Error:', JSON.stringify(error, null, 2));
      return { products: [], error: error.message };
    }

    const lowInventoryProducts: LowInventoryProduct[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products?.map((p: any) => ({
        id: p.id,
        name: p.name,
        quantity: p.inventory.quantity,
        priority: getInventoryPriority(p.inventory.quantity) as AlertPriority,
      })) || [];

    return { products: lowInventoryProducts };
  } catch (error) {
    console.error('getLowInventoryProducts - Catch Error:', JSON.stringify(error, null, 2));
    return {
      products: [],
      error: error instanceof Error ? error.message : 'Failed to fetch low inventory products',
    };
  }
}

/**
 * Get pending returns (status = 'requested')
 * @returns Array of pending returns with customer info
 */
export async function getPendingReturns(): Promise<{
  returns: PendingReturn[];
  error?: string;
}> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: returns, error } = await supabase
      .from('returns')
      .select(
        `
        id,
        order_id,
        reason,
        requested_at,
        orders!inner(
          customer_id,
          customers (
            name
          )
        )
      `
      )
      .eq('status', 'requested')
      .order('requested_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('getPendingReturns - Error:', JSON.stringify(error, null, 2));
      return { returns: [], error: error.message };
    }

    const pendingReturns: PendingReturn[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      returns?.map((r: any) => ({
        id: r.id,
        order_id: r.order_id,
        customer_name: r.orders?.customers?.name || 'Unknown',
        request_date: r.requested_at,
        reason: r.reason || 'Not specified',
      })) || [];

    return { returns: pendingReturns };
  } catch (error) {
    console.error('getPendingReturns - Catch Error:', JSON.stringify(error, null, 2));
    return {
      returns: [],
      error: error instanceof Error ? error.message : 'Failed to fetch pending returns',
    };
  }
}

/**
 * Get open support tickets
 * Note: Requires support_tickets table (optional feature)
 * @returns Array of open tickets or empty array if table doesn't exist
 */
export async function getOpenSupportTickets(): Promise<{
  tickets: OpenSupportTicket[];
  error?: string;
  supported: boolean;
}> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Check if support_tickets table exists
    const { error: tableCheckError } = await supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true });

    if (tableCheckError) {
      // Table doesn't exist - return empty with supported: false
      return { tickets: [], supported: false };
    }

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select(
        `
        id,
        subject,
        created_at,
        customers!inner(name)
      `
      )
      .eq('status', 'open')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('getOpenSupportTickets - Error:', JSON.stringify(error, null, 2));
      return { tickets: [], supported: true, error: error.message };
    }

    const openTickets: OpenSupportTicket[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tickets?.map((t: any) => ({
        id: t.id,
        subject: t.subject,
        created_at: t.created_at,
        customer_name: t.customers?.name || 'Unknown',
        priority: getSupportTicketPriority([t]),
      })) || [];

    return { tickets: openTickets, supported: true };
  } catch (error) {
    console.error('getOpenSupportTickets - Catch Error:', JSON.stringify(error, null, 2));
    return {
      tickets: [],
      supported: false,
      error: error instanceof Error ? error.message : 'Failed to fetch support tickets',
    };
  }
}

/**
 * Get orders with failed payment status
 * @returns Array of failed payment orders
 */
export async function getFailedPaymentOrders(): Promise<{
  orders: FailedPaymentOrder[];
  error?: string;
}> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        total,
        created_at,
        customers!inner(name, email)
      `
      )
      .eq('status', 'payment_failed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('getFailedPaymentOrders - Error:', JSON.stringify(error, null, 2));
      return { orders: [], error: error.message };
    }

    const failedOrders: FailedPaymentOrder[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orders?.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        total: o.total,
        failure_date: o.created_at,
        customer_name: o.customers?.name || 'Unknown',
        customer_email: o.customers?.email || 'Unknown',
      })) || [];

    return { orders: failedOrders };
  } catch (error) {
    console.error('getFailedPaymentOrders - Catch Error:', JSON.stringify(error, null, 2));
    return {
      orders: [],
      error: error instanceof Error ? error.message : 'Failed to fetch failed payment orders',
    };
  }
}

/**
 * Get aggregated alert counts for all alert types
 * @returns Object with counts and priorities for all alert types
 */
export async function getAlertCounts(): Promise<{
  counts: AlertCounts;
  error?: string;
}> {
  try {
    await requireAdmin();

    const [lowInventory, pendingReturns, supportTickets, failedPayments] =
      await Promise.all([
        getLowInventoryProducts(),
        getPendingReturns(),
        getOpenSupportTickets(),
        getFailedPaymentOrders(),
      ]);

    return {
      counts: {
        lowInventory: {
          count: lowInventory.products.length,
          priority:
            lowInventory.products.length > 0
              ? getLowInventoryPriority(lowInventory.products)
              : 'medium',
        },
        pendingReturns: {
          count: pendingReturns.returns.length,
          priority:
            pendingReturns.returns.length > 0 ? getPendingReturnsPriority() : 'medium',
        },
        supportTickets: {
          count: supportTickets.tickets.length,
          priority:
            supportTickets.tickets.length > 0
              ? getSupportTicketPriority(supportTickets.tickets)
              : 'medium',
        },
        failedPayments: {
          count: failedPayments.orders.length,
          priority:
            failedPayments.orders.length > 0 ? getFailedPaymentsPriority() : 'medium',
        },
      },
    };
  } catch (error) {
    console.error('getAlertCounts - Catch Error:', JSON.stringify(error, null, 2));
    return {
      counts: {
        lowInventory: { count: 0, priority: 'medium' },
        pendingReturns: { count: 0, priority: 'medium' },
        supportTickets: { count: 0, priority: 'medium' },
        failedPayments: { count: 0, priority: 'medium' },
      },
      error: error instanceof Error ? error.message : 'Failed to fetch alert counts',
    };
  }
}

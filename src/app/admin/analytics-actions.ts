/**
 * Admin Analytics Server Actions — Data Visualization
 * Story 7.1b: Admin Dashboard - Data Visualization
 * AC1: Sales Trends, AC2: Top Products, AC3: Customer Growth, AC4: Order Status Distribution
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { CACHE_KEYS, CACHE_TTL, withCache } from '@/lib/cache/analytics-cache';

export type TimeRange = 'daily' | 'weekly' | 'monthly';

export interface SalesTrendData {
  date: string;
  revenue: number;
}

export interface TopProductData {
  id: string;
  name: string;
  revenue: number;
}

export interface CustomerGrowthData {
  date: string;
  newSignups: number;
  activeUsers: number;
}

export interface OrderStatusData {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  count: number;
  percentage: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getPeriodKey(date: Date, timeRange: TimeRange): string {
  if (timeRange === 'daily') {
    return date.toISOString().split('T')[0];
  } else if (timeRange === 'weekly') {
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return monday.toISOString().split('T')[0];
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
  }
}

function getDaysBack(timeRange: TimeRange): number {
  return timeRange === 'daily' ? 30 : timeRange === 'weekly' ? 84 : 365;
}

// ---------------------------------------------------------------------------
// AC1: getSalesTrends
// Revenue aggregated by day/week/month, excludes cancelled + refunded
// ---------------------------------------------------------------------------
export async function getSalesTrends(timeRange: TimeRange = 'daily'): Promise<SalesTrendData[]> {
  await requireAdmin();

  return withCache<SalesTrendData[]>(
    CACHE_KEYS.salesTrends(timeRange),
    CACHE_TTL.salesTrends,
    async () => {
      const supabase = createAdminClient();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - getDaysBack(timeRange));

      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total')
        .gte('created_at', cutoffDate.toISOString())
        .lte('created_at', new Date().toISOString())
        .not('status', 'in', '(cancelled,refunded)')
        .order('created_at', { ascending: true });

      if (error || !data) {
        console.error('[getSalesTrends] Error:', error);
        return [];
      }

      const aggregated = new Map<string, number>();

      (data as Array<{ created_at: string; total: number }>).forEach((order) => {
        const key = getPeriodKey(new Date(order.created_at), timeRange);
        aggregated.set(key, (aggregated.get(key) ?? 0) + (order.total ?? 0));
      });

      return Array.from(aggregated.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
  );
}

// ---------------------------------------------------------------------------
// AC2: getTopProducts
// Top N products by revenue from DELIVERED orders in last `days` days
// ---------------------------------------------------------------------------
export async function getTopProducts(
  limit: number = 10,
  days: number = 30
): Promise<TopProductData[]> {
  await requireAdmin();

  return withCache<TopProductData[]>(
    CACHE_KEYS.topProducts(),
    CACHE_TTL.topProducts,
    async () => {
      const supabase = createAdminClient();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Fetch delivered order items joined to their orders
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('product_id, quantity, price, orders!inner(status, created_at)')
        .eq('orders.status', 'delivered')
        .gte('orders.created_at', cutoffDate.toISOString());

      if (error || !orderItems) {
        console.error('[getTopProducts] Error:', error);
        return [];
      }

      // Aggregate revenue per product_id
      const productRevenue = new Map<string, number>();
      (orderItems as Array<{ product_id: string; quantity: number; price: number }>).forEach(
        (item) => {
          const rev = (item.quantity ?? 0) * (item.price ?? 0);
          productRevenue.set(item.product_id, (productRevenue.get(item.product_id) ?? 0) + rev);
        }
      );

      if (productRevenue.size === 0) return [];

      const topIds = Array.from(productRevenue.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name')
        .in('id', topIds);

      if (prodError || !products) return [];

      return (products as Array<{ id: string; name: string }>)
        .map((p) => ({ id: p.id, name: p.name, revenue: productRevenue.get(p.id) ?? 0 }))
        .sort((a, b) => b.revenue - a.revenue);
    }
  );
}

// ---------------------------------------------------------------------------
// AC3: getCustomerGrowth
// New signups + active users per day/week/month
// ---------------------------------------------------------------------------
export async function getCustomerGrowth(
  timeRange: TimeRange = 'daily'
): Promise<CustomerGrowthData[]> {
  await requireAdmin();

  return withCache<CustomerGrowthData[]>(
    CACHE_KEYS.customerGrowth(timeRange),
    CACHE_TTL.customerGrowth,
    async () => {
      const supabase = createAdminClient();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - getDaysBack(timeRange));

      const { data: customers, error } = await supabase
        .from('customers')
        .select('created_at, last_login')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: true });

      if (error || !customers) {
        console.error('[getCustomerGrowth] Error:', error);
        return [];
      }

      const typedCustomers = customers as Array<{ created_at: string; last_login?: string }>;
      const periods = new Map<string, { newSignups: number }>();

      typedCustomers.forEach((c) => {
        const key = getPeriodKey(new Date(c.created_at), timeRange);
        const existing = periods.get(key) ?? { newSignups: 0 };
        existing.newSignups += 1;
        periods.set(key, existing);
      });

      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      return Array.from(periods.entries())
        .map(([date, { newSignups }]) => {
          const periodDate = new Date(date).getTime();
          const activeUsers = typedCustomers.filter((c) => {
            if (!c.last_login) return false;
            const loginTime = new Date(c.last_login).getTime();
            return loginTime >= periodDate - thirtyDaysMs && loginTime <= periodDate;
          }).length;

          return { date, newSignups, activeUsers };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
    }
  );
}

// ---------------------------------------------------------------------------
// AC4: getOrderStatusDistribution
// Status counts + percentages for last `days` days
// ---------------------------------------------------------------------------
export async function getOrderStatusDistribution(days: number = 30): Promise<OrderStatusData[]> {
  await requireAdmin();

  return withCache<OrderStatusData[]>(
    CACHE_KEYS.orderStatus(),
    CACHE_TTL.orderStatus,
    async () => {
      const supabase = createAdminClient();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .gte('created_at', cutoffDate.toISOString());

      if (error || !data) {
        console.error('[getOrderStatusDistribution] Error:', error);
        return [];
      }

      const validStatuses = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ] as const;

      const counts = new Map<string, number>();

      (data as Array<{ status: string }>).forEach((order) => {
        if ((validStatuses as readonly string[]).includes(order.status)) {
          counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
        }
      });

      const total = Array.from(counts.values()).reduce((s, c) => s + c, 0);
      if (total === 0) return [];

      return Array.from(counts.entries())
        .map(([status, count]) => ({
          status: status as OrderStatusData['status'],
          count,
          percentage: Math.round((count / total) * 100 * 100) / 100,
        }))
        .sort((a, b) => b.count - a.count);
    }
  );
}

// ---------------------------------------------------------------------------
// getDashboardChartData — parallel fetch helper for dashboard page
// ---------------------------------------------------------------------------
export async function getDashboardChartData(timeRange: TimeRange = 'daily') {
  await requireAdmin();

  const [salesTrends, topProducts, customerGrowth, orderStatus] = await Promise.all([
    getSalesTrends(timeRange),
    getTopProducts(),
    getCustomerGrowth(timeRange),
    getOrderStatusDistribution(),
  ]);

  return { salesTrends, topProducts, customerGrowth, orderStatus };
}

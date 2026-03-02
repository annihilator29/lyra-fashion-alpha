/**
 * Analytics Server Actions Tests
 * Story 7.1b: Admin Dashboard - Data Visualization
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  getSalesTrends,
  getTopProducts,
  getCustomerGrowth,
  getOrderStatusDistribution,
  getDashboardChartData,
} from '@/app/admin/analytics-actions';
import { requireAdmin } from '@/lib/auth/roles';
import { createAdminClient } from '@/lib/supabase/admin';

// Mock dependencies
jest.mock('@/lib/auth/roles');
jest.mock('@/lib/supabase/admin');
jest.mock('@/lib/cache/analytics-cache', () => ({
  CACHE_KEYS: {
    salesTrends: (r: string) => `analytics:sales:${r}`,
    topProducts: () => 'analytics:top-products',
    customerGrowth: (r: string) => `analytics:customers:${r}`,
    orderStatus: () => 'analytics:status',
  },
  CACHE_TTL: { salesTrends: 300, topProducts: 600, customerGrowth: 300, orderStatus: 60 },
  // Bypass cache in tests — always call fetcher
  withCache: jest.fn(async (_key: string, _ttl: number, fetcher: () => Promise<any>) => fetcher()),
}));

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>;

// Shared mock builder
function buildSupabaseMock(overrides: any = {}): any {
  const base = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        gte: jest.fn().mockReturnValue({
          lte: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({ data: [], error: null }),
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
        in: jest.fn().mockResolvedValue({ data: [], error: null }),
        eq: jest.fn().mockReturnValue({
          gte: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
  };
  return { ...base, ...overrides };
}

describe('Analytics Server Actions (7.1b)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue(undefined);
  });

  // ---------------------------------------------------------------------------
  // getSalesTrends
  // ---------------------------------------------------------------------------
  describe('getSalesTrends', () => {
    it('should return aggregated daily revenue data', async () => {
      const mockOrders = [
        { created_at: '2026-01-01T10:00:00Z', total: 5000 },
        { created_at: '2026-01-01T15:00:00Z', total: 3000 },
        { created_at: '2026-01-02T09:00:00Z', total: 2000 },
      ];

      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                not: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
                }),
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getSalesTrends('daily');
      expect(result).toHaveLength(2); // 2 distinct dates
      expect(result[0]).toEqual({ date: '2026-01-01', revenue: 8000 });
      expect(result[1]).toEqual({ date: '2026-01-02', revenue: 2000 });
    });

    it('should return empty array when no orders', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                not: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getSalesTrends('daily');
      expect(result).toEqual([]);
    });

    it('should return empty array on DB error', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lte: jest.fn().mockReturnValue({
                not: jest.fn().mockReturnValue({
                  order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
                }),
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getSalesTrends('daily');
      expect(result).toEqual([]);
    });

    it('should support weekly and monthly time ranges', async () => {
      const mockSupabase = buildSupabaseMock();
      // Ensure the order chain returns empty data
      const orderFn = jest.fn().mockResolvedValue({ data: [], error: null });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              not: jest.fn().mockReturnValue({ order: orderFn }),
            }),
          }),
        }),
      });
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      await getSalesTrends('weekly');
      await getSalesTrends('monthly');
      // No errors thrown — just verifying both ranges work
      expect(orderFn).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------------------
  // getTopProducts
  // ---------------------------------------------------------------------------
  describe('getTopProducts', () => {
    it('should return products sorted by revenue descending', async () => {
      const mockOrderItems = [
        { product_id: 'p1', quantity: 2, price: 5000 },
        { product_id: 'p2', quantity: 1, price: 8000 },
        { product_id: 'p1', quantity: 1, price: 5000 },
      ];
      const mockProducts = [
        { id: 'p1', name: 'Silk Blouse' },
        { id: 'p2', name: 'Linen Jacket' },
      ];

      const mockSupabase = {
        from: jest.fn().mockImplementation((table: string) => {
          if (table === 'order_items') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  gte: jest.fn().mockResolvedValue({ data: mockOrderItems, error: null }),
                }),
              }),
            };
          }
          // products table
          return {
            select: jest.fn().mockReturnValue({
              in: jest.fn().mockResolvedValue({ data: mockProducts, error: null }),
            }),
          };
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getTopProducts(10);
      expect(result).toHaveLength(2);
      // p1: 2×5000 + 1×5000 = 15000, p2: 1×8000 = 8000
      expect(result[0].id).toBe('p1');
      expect(result[0].revenue).toBe(15000);
      expect(result[1].id).toBe('p2');
      expect(result[1].revenue).toBe(8000);
    });

    it('should return empty array when no delivered orders', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getTopProducts();
      expect(result).toEqual([]);
    });

    it('should return empty array on DB error', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gte: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getTopProducts();
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // getCustomerGrowth
  // ---------------------------------------------------------------------------
  describe('getCustomerGrowth', () => {
    it('should aggregate new signups by day', async () => {
      const mockCustomers = [
        { created_at: '2026-01-01T08:00:00Z', last_login: '2026-01-01T08:00:00Z' },
        { created_at: '2026-01-01T18:00:00Z', last_login: '2026-01-01T18:00:00Z' },
        { created_at: '2026-01-02T09:00:00Z', last_login: '2026-01-02T09:00:00Z' },
      ];

      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: mockCustomers, error: null }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getCustomerGrowth('daily');
      expect(result.length).toBeGreaterThan(0);
      const jan1 = result.find((r) => r.date === '2026-01-01');
      expect(jan1?.newSignups).toBe(2);
      const jan2 = result.find((r) => r.date === '2026-01-02');
      expect(jan2?.newSignups).toBe(1);
    });

    it('should return empty array when no customers', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getCustomerGrowth('daily');
      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // getOrderStatusDistribution
  // ---------------------------------------------------------------------------
  describe('getOrderStatusDistribution', () => {
    it('should return status counts with percentages', async () => {
      const mockOrders = [
        { status: 'pending' },
        { status: 'pending' },
        { status: 'delivered' },
        { status: 'shipped' },
      ];

      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getOrderStatusDistribution();
      expect(result.length).toBe(3); // pending, delivered, shipped

      const pending = result.find((r) => r.status === 'pending');
      expect(pending?.count).toBe(2);
      expect(pending?.percentage).toBe(50);
    });

    it('should return empty array when no orders', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getOrderStatusDistribution();
      expect(result).toEqual([]);
    });

    it('should exclude invalid status values', async () => {
      const mockOrders = [
        { status: 'pending' },
        { status: 'unknown_status' },
        { status: 'delivered' },
      ];

      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getOrderStatusDistribution();
      const statuses = result.map((r) => r.status);
      expect(statuses).not.toContain('unknown_status');
    });
  });

  // ---------------------------------------------------------------------------
  // getDashboardChartData
  // ---------------------------------------------------------------------------
  describe('getDashboardChartData', () => {
    it('should return all four data sets', async () => {
      const mockSupabase = buildSupabaseMock();
      // Wire up basic chain returning empty data
      const emptyResult = { data: [], error: null };
      const orderFn = jest.fn().mockResolvedValue(emptyResult);
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({ not: jest.fn().mockReturnValue({ order: orderFn }) }),
            order: orderFn,
            eq: jest.fn().mockReturnValue({ gte: jest.fn().mockResolvedValue(emptyResult) }),
            mockResolvedValue: undefined,
          }),
          in: jest.fn().mockResolvedValue(emptyResult),
          eq: jest.fn().mockReturnValue({ gte: jest.fn().mockResolvedValue(emptyResult) }),
        }),
      });
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getDashboardChartData('daily');
      expect(result).toHaveProperty('salesTrends');
      expect(result).toHaveProperty('topProducts');
      expect(result).toHaveProperty('customerGrowth');
      expect(result).toHaveProperty('orderStatus');
      expect(Array.isArray(result.salesTrends)).toBe(true);
      expect(Array.isArray(result.topProducts)).toBe(true);
      expect(Array.isArray(result.customerGrowth)).toBe(true);
      expect(Array.isArray(result.orderStatus)).toBe(true);
    });
  });
});

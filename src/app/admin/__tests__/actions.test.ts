/**
 * Admin Analytics Actions Tests
 * Story 7.1a: Admin Dashboard - Foundation
 * AC3: Key Metrics Display
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  getTodaysRevenue,
  getOrderCountsByStatus,
  getTodaysNewSignups,
  getActiveUserCount,
  getDashboardMetrics,
} from '@/app/admin/actions';
import { requireAdmin } from '@/lib/auth/roles';
import { createAdminClient } from '@/lib/supabase/admin';

// Mock dependencies
jest.mock('@/lib/auth/roles');
jest.mock('@/lib/supabase/admin');

const mockRequireAdmin = requireAdmin as jest.MockedFunction<typeof requireAdmin>;
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>;

describe('Admin Analytics Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdmin.mockResolvedValue(undefined);
  });

  describe('getTodaysRevenue', () => {
    it('should return revenue amount successfully', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lt: jest.fn().mockReturnValue({
                not: jest.fn().mockResolvedValue({
                  data: [{ total: 10000 }, { total: 5000 }],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getTodaysRevenue();
      expect(result.amount).toBe(15000);
      expect(result.error).toBeUndefined();
    });

    it('should return 0 when no orders exist', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lt: jest.fn().mockReturnValue({
                not: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getTodaysRevenue();
      expect(result.amount).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lt: jest.fn().mockReturnValue({
                not: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' },
                }),
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getTodaysRevenue();
      expect(result.amount).toBe(0);
      expect(result.error).toBeDefined();
    });
  });

  describe('getOrderCountsByStatus', () => {
    it('should return counts for all statuses', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lt: jest.fn().mockResolvedValue({
                data: [
                  { status: 'pending' },
                  { status: 'pending' },
                  { status: 'processing' },
                  { status: 'shipped' },
                ],
                error: null,
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getOrderCountsByStatus();
      expect(result.pending).toBe(2);
      expect(result.processing).toBe(1);
      expect(result.shipped).toBe(1);
      expect(result.error).toBeUndefined();
    });

    it('should return zero counts when no orders exist', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lt: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getOrderCountsByStatus();
      expect(result.pending).toBe(0);
      expect(result.processing).toBe(0);
      expect(result.shipped).toBe(0);
    });
  });

  describe('getTodaysNewSignups', () => {
    it('should return count of new signups', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lt: jest.fn().mockResolvedValue({
                count: 5,
                error: null,
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getTodaysNewSignups();
      expect(result.count).toBe(5);
      expect(result.error).toBeUndefined();
    });

    it('should return 0 when no new signups', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lt: jest.fn().mockResolvedValue({
                count: 0,
                error: null,
              }),
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getTodaysNewSignups();
      expect(result.count).toBe(0);
    });
  });

  describe('getActiveUserCount', () => {
    it('should return count of active users', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({
              count: 42,
              error: null,
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getActiveUserCount();
      expect(result.count).toBe(42);
      expect(result.error).toBeUndefined();
    });

    it('should calculate correct 30-day window', async () => {
      let capturedDate: string | undefined;
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockImplementation((_field: string, date: string) => {
              capturedDate = date;
              return Promise.resolve({ count: 10, error: null });
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      await getActiveUserCount();

      // Verify the date is approximately 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = new Date(capturedDate!);
      const diffDays = Math.abs(
        (thirtyDaysAgo.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBeLessThan(1);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return all required metric properties', async () => {
      // Mock to return safe defaults for all query shapes:
      // getTodaysRevenue: .from().select().gte().lt().not()
      // getOrderCountsByStatus: .from().select().gte().lt()
      // getTodaysNewSignups: .from().select().gte().lt() (count query)
      // getActiveUserCount: .from().select().gte() (count query)
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            gte: jest.fn().mockReturnValue({
              lt: jest.fn().mockReturnValue({
                // Handles both data and count queries, plus .not() chain
                not: jest.fn().mockResolvedValue({ data: [], error: null }),
                // For count queries that stop at lt (getTodaysNewSignups)
                then: undefined,
                count: 0,
                error: null,
                data: [],
              }),
              // For count queries that stop at gte (getActiveUserCount)
              then: undefined,
              count: 5,
              error: null,
              data: [],
            }),
          }),
        }),
      };
      mockCreateAdminClient.mockReturnValue(mockSupabase as any);

      const result = await getDashboardMetrics();

      expect(result).toHaveProperty('todaysRevenue');
      expect(result).toHaveProperty('newOrders');
      expect(result).toHaveProperty('processingOrders');
      expect(result).toHaveProperty('shippedOrders');
      expect(result).toHaveProperty('newSignups');
      expect(result).toHaveProperty('activeUsers');
    });

    it('should handle errors gracefully when requireAdmin throws', async () => {
      mockRequireAdmin.mockRejectedValue(new Error('Unauthorized'));

      const result = await getDashboardMetrics();

      expect(result.todaysRevenue).toBe(0);
      expect(result.errors).toContain('Failed to fetch dashboard metrics');
    });
  });
});

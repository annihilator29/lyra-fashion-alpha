/**
 * Customer Activity Timeline Server Actions Tests
 * Story 7.4c: Customer Activity Timeline
 *
 * Tests for activity timeline server actions:
 * - getCustomerActivityTimeline
 * - logActivity
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock Supabase admin client
jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

// Mock auth roles
jest.mock('@/lib/auth/roles', () => ({
  requireAdmin: jest.fn(),
}));

// Mock Next cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Helper: build a query chain that resolves with the given result
function buildQueryChain(resolveData: { data: unknown; error: unknown; count?: number }) {
  // The chain always returns itself for chaining, except the final await
  const chain: Record<string, jest.Mock> = {};
  const methods = ['select', 'eq', 'in', 'gte', 'lte', 'range', 'order', 'insert', 'single'];
  for (const m of methods) {
    chain[m] = jest.fn();
    chain[m].mockReturnValue(chain);
  }
  // The chain itself is thenable so `await chain` works
  (chain as any).then = (resolve: (v: any) => void) => resolve(resolveData);
  (chain as any).catch = () => chain;
  (chain as any).finally = (fn: () => void) => { fn(); return chain; };
  return chain;
}

describe('Activity Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // getCustomerActivityTimeline
  // =========================================================================

  describe('getCustomerActivityTimeline', () => {
    it('should fetch activities for a customer', async () => {
      const { getCustomerActivityTimeline } = await import('../activity-actions');

      const mockActivities = [
        {
          id: 'act-1',
          customer_id: 'cust-1',
          activity_type: 'order_placed',
          activity_data: { order_id: 'ord-1', order_number: 'ORD-001', total: 5000 },
          created_at: '2026-03-19T10:00:00Z',
        },
        {
          id: 'act-2',
          customer_id: 'cust-1',
          activity_type: 'ticket_created',
          activity_data: { ticket_id: 'tkt-1', subject: 'Missing item' },
          created_at: '2026-03-18T14:00:00Z',
        },
      ];

      const chain = buildQueryChain({ data: mockActivities, error: null, count: 2 });
      const mockFrom = jest.fn().mockReturnValue(chain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await getCustomerActivityTimeline('cust-1');

      expect(result.activities).toHaveLength(2);
      expect(result.activities[0].activity_type).toBe('order_placed');
      expect(result.activities[1].activity_type).toBe('ticket_created');
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it('should filter activities by type', async () => {
      const { getCustomerActivityTimeline } = await import('../activity-actions');

      const chain = buildQueryChain({
        data: [
          {
            id: 'act-1',
            customer_id: 'cust-1',
            activity_type: 'order_placed',
            activity_data: {},
            created_at: '2026-03-19T10:00:00Z',
          },
        ],
        error: null,
        count: 1,
      });
      const mockFrom = jest.fn().mockReturnValue(chain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await getCustomerActivityTimeline('cust-1', {
        types: ['order_placed'],
      });

      expect(result.activities).toHaveLength(1);
      expect(result.activities[0].activity_type).toBe('order_placed');
    });

    it('should filter activities by date range', async () => {
      const { getCustomerActivityTimeline } = await import('../activity-actions');

      const chain = buildQueryChain({ data: [], error: null, count: 0 });
      const mockFrom = jest.fn().mockReturnValue(chain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await getCustomerActivityTimeline('cust-1', {
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });

      expect(result.activities).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle pagination with offset', async () => {
      const { getCustomerActivityTimeline } = await import('../activity-actions');

      const chain = buildQueryChain({
        data: [
          {
            id: 'act-5',
            customer_id: 'cust-1',
            activity_type: 'email_sent',
            activity_data: {},
            created_at: '2026-03-10T10:00:00Z',
          },
        ],
        error: null,
        count: 100,
      });
      const mockFrom = jest.fn().mockReturnValue(chain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await getCustomerActivityTimeline('cust-1', {
        limit: 10,
        offset: 50,
      });

      expect(result.activities).toHaveLength(1);
      expect(result.hasMore).toBe(true);
    });

    it('should return hasMore false when all activities loaded', async () => {
      const { getCustomerActivityTimeline } = await import('../activity-actions');

      const chain = buildQueryChain({ data: [], error: null, count: 5 });
      const mockFrom = jest.fn().mockReturnValue(chain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await getCustomerActivityTimeline('cust-1', {
        limit: 50,
        offset: 0,
      });

      expect(result.hasMore).toBe(false);
    });

    it('should handle empty results', async () => {
      const { getCustomerActivityTimeline } = await import('../activity-actions');

      const chain = buildQueryChain({ data: [], error: null, count: 0 });
      const mockFrom = jest.fn().mockReturnValue(chain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await getCustomerActivityTimeline('cust-1');

      expect(result.activities).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const { getCustomerActivityTimeline } = await import('../activity-actions');

      const chain = buildQueryChain({
        data: null,
        error: { message: 'Database connection failed' },
        count: 0,
      });
      const mockFrom = jest.fn().mockReturnValue(chain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await getCustomerActivityTimeline('cust-1');

      expect(result.error).toBe('Database connection failed');
      expect(result.activities).toEqual([]);
    });
  });

  // =========================================================================
  // logActivity
  // =========================================================================

  describe('logActivity', () => {
    it('should log a new activity', async () => {
      const { logActivity } = await import('../activity-actions');

      const insertedActivity = {
        id: 'act-new',
        customer_id: 'cust-1',
        activity_type: 'order_placed',
        activity_data: { order_id: 'ord-1', order_number: 'ORD-001', total: 5000 },
        created_at: '2026-03-19T12:00:00Z',
      };

      // For insert, chain goes: from -> insert -> select -> single -> resolve
      const singleChain: any = {
        then: (resolve: (v: any) => void) => resolve({ data: insertedActivity, error: null }),
      };
      const selectChain: any = {
        single: jest.fn().mockReturnValue(singleChain),
      };
      const insertChain: any = {
        select: jest.fn().mockReturnValue(selectChain),
      };
      const fromChain: any = {
        insert: jest.fn().mockReturnValue(insertChain),
      };
      const mockFrom = jest.fn().mockReturnValue(fromChain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await logActivity('cust-1', 'order_placed', {
        order_id: 'ord-1',
        order_number: 'ORD-001',
        total: 5000,
      });

      expect(result.activity).toEqual(insertedActivity);
      expect(result.error).toBeUndefined();
    });

    it('should handle insertion errors', async () => {
      const { logActivity } = await import('../activity-actions');

      const singleChain: any = {
        then: (resolve: (v: any) => void) => resolve({ data: null, error: { message: 'Insert failed' } }),
      };
      const selectChain: any = {
        single: jest.fn().mockReturnValue(singleChain),
      };
      const insertChain: any = {
        select: jest.fn().mockReturnValue(selectChain),
      };
      const fromChain: any = {
        insert: jest.fn().mockReturnValue(insertChain),
      };
      const mockFrom = jest.fn().mockReturnValue(fromChain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await logActivity('cust-1', 'ticket_created', {
        ticket_id: 'tkt-1',
        subject: 'Test ticket',
      });

      expect(result.activity).toBeNull();
      expect(result.error).toBe('Insert failed');
    });

    it('should log activity with empty data', async () => {
      const { logActivity } = await import('../activity-actions');

      const insertedActivity = {
        id: 'act-empty',
        customer_id: 'cust-1',
        activity_type: 'preference_updated',
        activity_data: {},
        created_at: '2026-03-19T12:00:00Z',
      };

      const singleChain: any = {
        then: (resolve: (v: any) => void) => resolve({ data: insertedActivity, error: null }),
      };
      const selectChain: any = {
        single: jest.fn().mockReturnValue(singleChain),
      };
      const insertChain: any = {
        select: jest.fn().mockReturnValue(selectChain),
      };
      const fromChain: any = {
        insert: jest.fn().mockReturnValue(insertChain),
      };
      const mockFrom = jest.fn().mockReturnValue(fromChain);
      const mockSupabase = { from: mockFrom };

      const { createAdminClient } = await import('@/lib/supabase/admin');
      jest.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await logActivity('cust-1', 'preference_updated', {});

      expect(result.activity).toEqual(insertedActivity);
    });
  });
});

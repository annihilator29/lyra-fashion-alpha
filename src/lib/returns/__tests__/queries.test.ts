/**
 * Returns Queries Tests
 * Story 6.4: Returns & Refunds Processing - Task 9.3
 * 
 * Tests for query functions with mocked Supabase client
 */

import {
  getReturnById,
  getReturnsForOrder,
  checkItemsAlreadyReturned,
} from '../queries';


// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === 'returns') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'return-123',
                  order_id: 'order-123',
                  order_item_ids: ['item-1'],
                  reason: 'size_fit',
                  status: 'requested',
                  rma_number: 'RMA-123-20250202',
                  refund_amount: 50.00,
                  requested_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  order: {
                    id: 'order-123',
                    order_number: 'ORD-2025-001',
                    customer_email: 'customer@example.com',
                  },
                },
                error: null,
              })),
              order: jest.fn(() => Promise.resolve({
                data: [
                  {
                    id: 'return-123',
                    order_id: 'order-123',
                    status: 'requested',
                    rma_number: 'RMA-123-20250202',
                  },
                  {
                    id: 'return-456',
                    order_id: 'order-123',
                    status: 'approved',
                    rma_number: 'RMA-123-20250203',
                  },
                ],
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'orders') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'order-123',
                  customer_id: 'user-123',
                  customer_email: 'customer@example.com',
                },
                error: null,
              })),
            })),
          })),
        };
      }
      return {};
    }),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'user-123', email: 'customer@example.com' } },
        error: null,
      })),
    },
  })),
}));

describe('Returns Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReturnById', () => {
    it('fetches return by ID successfully', async () => {
      const result = await getReturnById('return-123');

      expect(result.return).toBeDefined();
      expect(result.return?.id).toBe('return-123');
      expect(result.return?.rma_number).toBe('RMA-123-20250202');
      expect(result.error).toBeNull();
    });

    it('returns error for non-existent return', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: null,
                error: { message: 'Not found' },
              })),
            })),
          })),
        })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await getReturnById('non-existent');

      expect(result.return).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('getReturnsForOrder', () => {
    it('fetches all returns for an order', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn((table: string) => {
          if (table === 'returns') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  order: jest.fn(() => Promise.resolve({
                    data: [
                      {
                        id: 'return-123',
                        order_id: 'order-123',
                        status: 'requested',
                        rma_number: 'RMA-123-20250202',
                      },
                    ],
                    error: null,
                  })),
                })),
              })),
            };
          }
          return {};
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await getReturnsForOrder('order-123');

      expect(result.returns).toHaveLength(1);
      expect(result.returns?.[0].order_id).toBe('order-123');
    });
  });

  describe('checkItemsAlreadyReturned', () => {
    it('returns already returned items', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn((table: string) => {
          if (table === 'returns') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  neq: jest.fn(() => ({
                    data: [
                      {
                        order_item_ids: ['item-1', 'item-2'],
                        status: 'refunded',
                      },
                      {
                        order_item_ids: ['item-3'],
                        status: 'approved',
                      },
                    ],
                    error: null,
                  })),
                })),
              })),
            };
          }
          return {};
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await checkItemsAlreadyReturned('order-123', ['item-1', 'item-4']);

      expect(result.alreadyReturned).toContain('item-1');
      expect(result.alreadyReturned).not.toContain('item-4');
    });

    it('returns empty array when no items are returned', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              neq: jest.fn(() => Promise.resolve({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await checkItemsAlreadyReturned('order-123', ['item-1']);

      expect(result.alreadyReturned).toHaveLength(0);
    });
  });


});

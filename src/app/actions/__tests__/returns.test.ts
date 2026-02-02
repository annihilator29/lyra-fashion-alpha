/**
 * Returns Actions Tests
 * Story 6.4: Returns & Refunds Processing - Task 9.4
 * 
 * Tests for Stripe refund integration in test mode
 */

import {
  processStripeRefund,
  getRefundStatus,
  validatePartialRefund,
} from '../returns';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    refunds: {
      create: jest.fn(),
    },
  }));
});

// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
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
                  status: 'inspected',
                  refund_amount: 150.00,
                  stripe_refund_id: null,
                  order_item_ids: ['item-1', 'item-2'],
                  rma_number: 'RMA-123-20250202',
                  order: {
                    id: 'order-123',
                    payment_intent_id: 'pi_1234567890',
                    customer_id: 'user-123',
                    customer_email: 'customer@example.com',
                  },
                },
                error: null,
              })),
            })),
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      if (table === 'order_items') {
        return {
          select: jest.fn(() => ({
            in: jest.fn(() => ({
              select: jest.fn(() => Promise.resolve({
                data: [
                  { id: 'item-1', product_id: 'prod-1', quantity: 1 },
                  { id: 'item-2', product_id: 'prod-2', quantity: 2 },
                ],
                error: null,
              })),
            })),
          })),
        };
      }
      return {};
    }),
    rpc: jest.fn(() => Promise.resolve({ error: null })),
  })),
}));

describe('Returns Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processStripeRefund', () => {
    it('processes refund successfully', async () => {
      const Stripe = await import('stripe');
      const mockStripeInstance = {
        refunds: {
          create: jest.fn(() => Promise.resolve({
            id: 're_1234567890',
            amount: 15000, // in cents
            status: 'succeeded',
          })),
        },
      };
      (Stripe as unknown as { default: jest.Mock }).default.mockImplementation(() => mockStripeInstance);

      const result = await processStripeRefund('return-123');

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('re_1234567890');
      expect(mockStripeInstance.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_1234567890',
        amount: 15000, // 150.00 * 100
        reason: 'requested_by_customer',
        metadata: {
          return_id: 'return-123',
          rma_number: 'RMA-123-20250202',
          order_id: 'order-123',
          is_guest: 'false',
        },
      });
    });

    it('returns error if return not found', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
            })),
          })),
        })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await processStripeRefund('non-existent-return');

      expect(result.success).toBe(false);
      expect(result.error).toBe('RETURN_NOT_FOUND');
    });

    it('returns error if return status is not inspected', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn((table: string) => {
          if (table === 'returns') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: {
                      id: 'return-123',
                      status: 'received', // Not inspected
                      refund_amount: 150.00,
                      order: {
                        payment_intent_id: 'pi_1234567890',
                      },
                    },
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

      const result = await processStripeRefund('return-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_STATUS');
    });

    it('returns error if already refunded', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn((table: string) => {
          if (table === 'returns') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: {
                      id: 'return-123',
                      status: 'inspected',
                      stripe_refund_id: 're_existing123',
                      order: {
                        payment_intent_id: 'pi_1234567890',
                      },
                    },
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

      const result = await processStripeRefund('return-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_REFUNDED');
    });

    it('returns error if no payment intent', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn((table: string) => {
          if (table === 'returns') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: {
                      id: 'return-123',
                      status: 'inspected',
                      order: {
                        payment_intent_id: null, // No payment intent
                      },
                    },
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

      const result = await processStripeRefund('return-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_PAYMENT_INTENT');
    });

    it('handles guest orders correctly', async () => {
      const Stripe = await import('stripe');
      const mockStripeInstance = {
        refunds: {
          create: jest.fn(() => Promise.resolve({
            id: 're_guest123',
            amount: 15000,
            status: 'succeeded',
          })),
        },
      };
      (Stripe as unknown as { default: jest.Mock }).default.mockImplementation(() => mockStripeInstance);

      const { createClient } = await import('@/lib/supabase/server');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn((table: string) => {
          if (table === 'returns') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: {
                      id: 'return-123',
                      status: 'inspected',
                      refund_amount: 150.00,
                      rma_number: 'RMA-123-20250202',
                      order_item_ids: ['item-1'],
                      order: {
                        id: 'order-123',
                        payment_intent_id: 'pi_1234567890',
                        customer_id: null, // Guest order
                        customer_email: 'guest@example.com',
                      },
                    },
                    error: null,
                  })),
                })),
              })),
              update: jest.fn(() => ({
                eq: jest.fn(() => Promise.resolve({ error: null })),
              })),
            };
          }
          if (table === 'order_items') {
            return {
              select: jest.fn(() => ({
                in: jest.fn(() => ({
                  select: jest.fn(() => Promise.resolve({
                    data: [{ id: 'item-1', product_id: 'prod-1', quantity: 1 }],
                    error: null,
                  })),
                })),
              })),
            };
          }
          return {};
        }),
        rpc: jest.fn(() => Promise.resolve({ error: null })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await processStripeRefund('return-123');

      expect(result.success).toBe(true);
      expect(mockStripeInstance.refunds.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            is_guest: 'true',
          }),
        })
      );
    });
  });

  describe('getRefundStatus', () => {
    it('returns refund status for valid return', async () => {
      const result = await getRefundStatus('return-123');

      expect(result.status).toBe('inspected');
      expect(result.refundId).toBeNull();
      expect(result.refundedAt).toBeNull();
    });

    it('returns unknown status for non-existent return', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
            })),
          })),
        })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await getRefundStatus('non-existent');

      expect(result.status).toBe('unknown');
      expect(result.error).toBe('Return not found');
    });
  });

  describe('validatePartialRefund', () => {
    it('validates partial refund correctly', async () => {
      const result = await validatePartialRefund('order-123', ['item-1', 'item-2']);

      expect(result.valid).toBe(true);
      expect(result.alreadyRefunded).toEqual([]);
    });

    it('detects already refunded items', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn((table: string) => {
          if (table === 'returns') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => Promise.resolve({
                    data: [
                      { order_item_ids: ['item-1'], status: 'refunded' },
                    ],
                    error: null,
                  })),
                })),
              })),
            };
          }
          if (table === 'order_items') {
            return {
              select: jest.fn(() => ({
                in: jest.fn(() => Promise.resolve({
                  data: [{ price: 50, quantity: 1 }],
                  error: null,
                })),
              })),
            };
          }
          return {};
        }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await validatePartialRefund('order-123', ['item-1']);

      expect(result.valid).toBe(false);
      expect(result.alreadyRefunded).toContain('item-1');
    });
  });
});

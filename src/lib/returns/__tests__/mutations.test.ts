/**
 * Returns Mutations Tests
 * Story 6.4: Returns & Refunds Processing - Task 9.3
 * 
 * Tests for mutation functions with mocked Supabase client
 */

import {
  createReturnRequest,
  updateReturnStatus,
  approveReturn,
  processRefund,
  rejectReturn,
} from '../mutations';
import type { Return, ReturnReason } from '@/types/returns';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === 'orders') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'order-123',
                  order_number: 'ORD-2025-001',
                  status: 'delivered',
                  delivered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                  customer_email: 'customer@example.com',
                  order_items: [
                    {
                      id: 'item-1',
                      price: 50.00,
                      quantity: 1,
                      products: { final_sale: false },
                    },
                    {
                      id: 'item-2',
                      price: 75.00,
                      quantity: 2,
                      products: { final_sale: false },
                    },
                  ],
                },
                error: null,
              })),
            })),
          })),
        };
      }
      if (table === 'returns') {
        const mockReturn: Return = {
          id: 'return-123',
          order_id: 'order-123',
          order_item_ids: ['item-1'],
          reason: 'size_fit' as ReturnReason,
          status: 'requested',
          rma_number: 'RMA-order-123-20250202',
          refund_amount: 50.00,
          requested_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          condition_notes: null,
          shipping_label_url: null,
          tracking_number: null,
          tracking_url: null,
          approved_at: null,
          shipped_at: null,
          received_at: null,
          inspected_at: null,
          inspected_by: null,
          inspection_notes: null,
          inspection_photos: null,
          rejected_at: null,
          rejection_reason: null,
          refunded_at: null,
          stripe_refund_id: null,
        };

        return {
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({
                data: mockReturn,
                error: null,
              })),
            })),
          })),
          update: jest.fn((data) => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { ...mockReturn, ...data },
                  error: null,
                })),
              })),
            })),
          })),
        };
      }
      return {};
    }),
  })),
}));

// Mock email service
jest.mock('@/lib/emails/returns', () => ({
  sendReturnRequestedEmail: jest.fn(() => Promise.resolve()),
  sendReturnApprovedEmail: jest.fn(() => Promise.resolve()),
  sendReturnRefundedEmail: jest.fn(() => Promise.resolve()),
  sendReturnRejectedEmail: jest.fn(() => Promise.resolve()),
}));

describe('Returns Mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReturnRequest', () => {
    it('creates a return request with valid data', async () => {
      const result = await createReturnRequest({
        orderId: 'order-123',
        itemIds: ['item-1'],
        reason: 'size_fit',
        conditionNotes: 'Too small',
      });

      expect(result.success).toBe(true);
      expect(result.return).toBeDefined();
      expect(result.return?.rma_number).toMatch(/^RMA-order-123-\d{8}$/);
      expect(result.return?.refund_amount).toBe(50.00);
      expect(result.return?.status).toBe('requested');
    });

    it('validates order ID format', async () => {
      const result = await createReturnRequest({
        orderId: 'invalid-id',
        itemIds: ['item-1'],
        reason: 'size_fit',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ORDER');
    });

    it('requires at least one item', async () => {
      const result = await createReturnRequest({
        orderId: 'order-123',
        itemIds: [],
        reason: 'size_fit',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ITEMS');
    });

    it('calculates correct refund amount for multiple items', async () => {
      const { createClient } = await import('@/lib/supabase/client');
      jest.mocked(createClient).mockReturnValueOnce({
        from: jest.fn((table: string) => {
          if (table === 'orders') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: {
                      id: 'order-123',
                      status: 'delivered',
                      delivered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                      customer_email: 'customer@example.com',
                      order_items: [
                        { id: 'item-1', price: 50.00, quantity: 1, products: { final_sale: false } },
                        { id: 'item-2', price: 75.00, quantity: 2, products: { final_sale: false } },
                      ],
                    },
                    error: null,
                  })),
                })),
              })),
            };
          }
          if (table === 'returns') {
            return {
              insert: jest.fn(() => ({
                select: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({
                    data: {
                      id: 'return-123',
                      order_id: 'order-123',
                      order_item_ids: ['item-1', 'item-2'],
                      reason: 'size_fit',
                      status: 'requested',
                      rma_number: 'RMA-order-123-20250202',
                      refund_amount: 200.00, // 50 + (75 * 2)
                      requested_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
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

      const result = await createReturnRequest({
        orderId: 'order-123',
        itemIds: ['item-1', 'item-2'],
        reason: 'size_fit',
      });

      expect(result.success).toBe(true);
      expect(result.return?.refund_amount).toBe(200.00);
    });
  });

  describe('updateReturnStatus', () => {
    it('updates return status to approved', async () => {
      const result = await updateReturnStatus('return-123', {
        status: 'approved',
      });

      expect(result.success).toBe(true);
      expect(result.return?.status).toBe('approved');
      expect(result.return?.approved_at).toBeDefined();
    });

    it('updates return status to received', async () => {
      const result = await updateReturnStatus('return-123', {
        status: 'received',
      });

      expect(result.success).toBe(true);
      expect(result.return?.status).toBe('received');
      expect(result.return?.received_at).toBeDefined();
    });

    it('validates return ID format', async () => {
      const result = await updateReturnStatus('invalid-id', {
        status: 'approved',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_RETURN');
    });
  });

  describe('approveReturn', () => {
    it('approves return with shipping label', async () => {
      const result = await approveReturn('return-123', {
        labelUrl: 'https://example.com/label.pdf',
        trackingNumber: 'TRACK123456',
        trackingUrl: 'https://track.example.com/123',
      });

      expect(result.success).toBe(true);
      expect(result.return?.status).toBe('approved');
      expect(result.return?.shipping_label_url).toBe('https://example.com/label.pdf');
      expect(result.return?.tracking_number).toBe('TRACK123456');
    });

    it('validates return ID format', async () => {
      const result = await approveReturn('invalid-id', {
        labelUrl: 'https://example.com/label.pdf',
        trackingNumber: 'TRACK123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_RETURN');
    });
  });

  describe('processRefund', () => {
    it('processes refund with Stripe ID', async () => {
      const result = await processRefund('return-123', 're_1234567890');

      expect(result.success).toBe(true);
      expect(result.return?.status).toBe('refunded');
      expect(result.return?.stripe_refund_id).toBe('re_1234567890');
      expect(result.return?.refunded_at).toBeDefined();
    });

    it('validates return ID format', async () => {
      const result = await processRefund('invalid-id', 're_1234567890');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_RETURN');
    });
  });

  describe('rejectReturn', () => {
    it('rejects return with reason', async () => {
      const result = await rejectReturn(
        'return-123',
        'Item shows signs of wear',
        'Tags removed, fabric stretched',
        ['photo1.jpg', 'photo2.jpg']
      );

      expect(result.success).toBe(true);
      expect(result.return?.status).toBe('rejected');
      expect(result.return?.rejection_reason).toBe('Item shows signs of wear');
      expect(result.return?.rejected_at).toBeDefined();
    });

    it('validates return ID format', async () => {
      const result = await rejectReturn('invalid-id', 'Reason');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_RETURN');
    });
  });

  describe('RMA number generation', () => {
    it('generates RMA number in correct format', async () => {
      const result = await createReturnRequest({
        orderId: 'order-123',
        itemIds: ['item-1'],
        reason: 'size_fit',
      });

      expect(result.success).toBe(true);
      expect(result.return?.rma_number).toMatch(/^RMA-order-123-\d{8}$/);
    });
  });
});

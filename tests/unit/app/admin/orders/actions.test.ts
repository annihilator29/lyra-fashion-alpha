/**
 * Unit Tests for Order Management Server Actions
 * Story 7.3: Order Management & Fulfillment Tools
 * 
 * @jest-environment node
 */

import type { OrderStatus } from '@/types/order';

import {
  getOrders,
  getOrderById,
  getCustomerOrderHistory,
  updateOrderStatus,
  addTrackingInfo,
  processRefund,
  addInternalNote,
  deleteInternalNote,
  bulkUpdateStatus,
  exportOrdersToCSV,
  generatePackingSlip,
  bulkPrintPackingSlips,
} from '@/app/admin/orders/actions';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { validateStatusTransition } from '@/lib/orders/status-transitions';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/supabase/admin');
jest.mock('@/lib/auth/roles');
jest.mock('@/lib/orders/status-transitions');
jest.mock('next/cache');
jest.mock('@/lib/email/order-emails', () => ({
  sendStatusUpdateEmail: jest.fn().mockResolvedValue({ success: true }),
  sendShippingConfirmationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendRefundConfirmationEmail: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('stripe', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      refunds: {
        create: jest.fn().mockResolvedValue({
          id: 're_test123',
          amount: 5000,
          status: 'succeeded',
        }),
      },
      errors: {
        StripeCardError: class StripeCardError extends Error {},
        StripeInvalidRequestError: class StripeInvalidRequestError extends Error {},
      },
    })),
  };
});

// Create a properly chained mock
const createMockSupabase = () => {
  const mock: any = {
    from: jest.fn(() => mock),
    select: jest.fn(() => mock),
    insert: jest.fn(() => mock),
    update: jest.fn(() => mock),
    delete: jest.fn(() => mock),
    eq: jest.fn(() => mock),
    gte: jest.fn(() => mock),
    lte: jest.fn(() => mock),
    or: jest.fn(() => mock),
    in: jest.fn(() => mock),
    range: jest.fn(() => mock),
    order: jest.fn(() => mock),
    limit: jest.fn(() => mock),
    single: jest.fn(),
  };
  return mock;
};

let mockSupabase: ReturnType<typeof createMockSupabase>;

describe('Order Management Actions', () => {
  const mockAdmin = { id: 'admin-123', role: 'admin' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabase();
    (requireAdmin as jest.Mock).mockResolvedValue(mockAdmin);
    (createAdminClient as jest.Mock).mockReturnValue(mockSupabase);
    (validateStatusTransition as jest.Mock).mockReturnValue({ valid: true });
    (revalidatePath as jest.Mock).mockImplementation(() => {});
  });

  describe('getOrders', () => {
    it('should fetch orders with default pagination', async () => {
      const mockOrders = [
        { id: 'order-1', order_number: 'LF-001', status: 'pending' },
        { id: 'order-2', order_number: 'LF-002', status: 'shipped' },
      ];

      mockSupabase.select.mockResolvedValue({
        data: mockOrders,
        count: 2,
        error: null,
      });

      const result = await getOrders();

      expect(requireAdmin).toHaveBeenCalled();
      expect(result.orders).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
    });

    it('should apply status filter', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await getOrders({ status: 'shipped' });

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'shipped');
    });

    it('should apply search filter with SQL injection sanitization', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      // Test with SQL injection attempt
      await getOrders({ search: '%DROP TABLE%;--' });

      // The search term should be sanitized
      expect(mockSupabase.or).toHaveBeenCalled();
      const orCall = mockSupabase.or.mock.calls[0][0];
      // Sanitized search should escape special characters
      expect(orCall).not.toContain('%DROP TABLE%;--');
    });

    it('should apply date range filters', async () => {
      mockSupabase.select.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      await getOrders({
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
      });

      expect(mockSupabase.gte).toHaveBeenCalledWith('created_at', '2025-01-01');
      expect(mockSupabase.lte).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockSupabase.select.mockResolvedValue({
        data: null,
        count: null,
        error: { message: 'Database connection failed' },
      });

      const result = await getOrders();

      expect(result.error).toBe('Database connection failed');
      expect(result.orders).toEqual([]);
    });
  });

  describe('getOrderById', () => {
    it('should fetch single order with details', async () => {
      const mockOrder = {
        id: 'order-1',
        order_number: 'LF-001',
        status: 'pending',
        customers: { name: 'John Doe', email: 'john@example.com' },
        order_items: [],
        order_notes: [],
      };

      mockSupabase.single.mockResolvedValue({
        data: mockOrder,
        error: null,
      });

      const result = await getOrderById('order-1');

      expect(requireAdmin).toHaveBeenCalled();
      expect(result.order).toEqual(mockOrder);
    });

    it('should handle order not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Order not found' },
      });

      const result = await getOrderById('non-existent');

      expect(result.order).toBeNull();
      expect(result.error).toBe('Order not found');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'pending',
        customer_id: 'customer-123',
        order_number: 'LF-001',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockOrder, error: null }) // First call for current order
        .mockResolvedValueOnce({ data: { ...mockOrder, status: 'processing' as OrderStatus }, error: null }); // Update result

      mockSupabase.from.mockReturnThis();

      const result = await updateOrderStatus('order-1', 'processing' as OrderStatus);

      expect(result.success).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'processing' as OrderStatus,
          production_started_at: expect.any(String),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/admin/orders');
    });

    it('should reject invalid status transitions', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'delivered',
        customer_id: 'customer-123',
        order_number: 'LF-001',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockOrder,
        error: null,
      });

      (validateStatusTransition as jest.Mock).mockReturnValue({
        valid: false,
        error: 'Invalid status transition from delivered to pending',
      });

      const result = await updateOrderStatus('order-1', 'pending');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid status transition');
    });

    it('should add status notes when provided', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'pending',
        customer_id: null,
        order_number: 'LF-001',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockOrder, error: null })
        .mockResolvedValueOnce({ data: { ...mockOrder, status: 'processing' as OrderStatus }, error: null });

      await updateOrderStatus('order-1', 'processing' as OrderStatus, 'Customer requested expedited processing');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status_notes: 'Customer requested expedited processing',
        })
      );
    });

    it('should record status history', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'pending',
        customer_id: null,
        order_number: 'LF-001',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockOrder, error: null })
        .mockResolvedValueOnce({ data: { ...mockOrder, status: 'shipped' }, error: null });

      mockSupabase.insert.mockResolvedValue({ data: null, error: null });

      await updateOrderStatus('order-1', 'shipped');

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'order-1',
          from_status: 'pending',
          to_status: 'shipped',
        })
      );
    });
  });

  describe('addTrackingInfo', () => {
    it('should add tracking info and send shipping email', async () => {
      const mockOrder = {
        id: 'order-1',
        customer_id: 'customer-123',
        order_number: 'LF-001',
        shipping_address: { line1: '123 Main St', city: 'NYC' },
        status: 'processing' as OrderStatus,
      };

      const mockCustomer = {
        email: 'customer@example.com',
        full_name: 'John Doe',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockOrder, error: null }) // Get order
        .mockResolvedValueOnce({ data: mockCustomer, error: null }); // Get customer

      mockSupabase.from.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ data: mockOrder, error: null });

      const result = await addTrackingInfo('order-1', 'ups', '1Z999AA1234567890');

      expect(result.success).toBe(true);
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          tracking_number: '1Z999AA1234567890',
          carrier: 'ups',
          status: 'shipped',
        })
      );
    });

    it('should validate tracking number length', async () => {
      const result = await addTrackingInfo('order-1', 'ups', '123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 5 characters');
    });

    it('should validate carrier', async () => {
      const result = await addTrackingInfo('order-1', 'invalid-carrier', '12345678');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid carrier');
    });
  });

  describe('processRefund', () => {
    it('should process full refund successfully', async () => {
      const mockOrder = {
        id: 'order-1',
        total: 10000,
        refunded_amount: 0,
        stripe_payment_intent_id: 'pi_test123',
        order_number: 'LF-001',
        customer_id: 'customer-123',
      };

      const mockCustomer = {
        email: 'customer@example.com',
        full_name: 'John Doe',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockOrder, error: null }) // Get order
        .mockResolvedValueOnce({ data: mockCustomer, error: null }); // Get customer

      mockSupabase.from.mockReturnThis();
      mockSupabase.insert.mockResolvedValue({ data: { id: 'refund-1' }, error: null });
      mockSupabase.update.mockResolvedValue({ data: null, error: null });

      const result = await processRefund('order-1', 10000, 'defective');

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('re_test123');
    });

    it('should validate refund amount does not exceed order total', async () => {
      const mockOrder = {
        id: 'order-1',
        total: 5000,
        refunded_amount: 0,
        stripe_payment_intent_id: 'pi_test123',
        order_number: 'LF-001',
        customer_id: null,
      };

      mockSupabase.single.mockResolvedValue({ data: mockOrder, error: null });

      const result = await processRefund('order-1', 6000, 'defective');

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds remaining order total');
    });

    it('should reject refund without payment intent', async () => {
      const mockOrder = {
        id: 'order-1',
        total: 10000,
        refunded_amount: 0,
        stripe_payment_intent_id: null,
        order_number: 'LF-001',
        customer_id: null,
      };

      mockSupabase.single.mockResolvedValue({ data: mockOrder, error: null });

      const result = await processRefund('order-1', 5000, 'changed_mind');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No payment intent found');
    });

    it('should validate refund amount is positive', async () => {
      const mockOrder = {
        id: 'order-1',
        total: 10000,
        refunded_amount: 0,
        stripe_payment_intent_id: 'pi_test123',
        order_number: 'LF-001',
        customer_id: null,
      };

      mockSupabase.single.mockResolvedValue({ data: mockOrder, error: null });

      const result = await processRefund('order-1', 0, 'changed_mind');

      expect(result.success).toBe(false);
      expect(result.error).toContain('must be greater than 0');
    });
  });

  describe('addInternalNote', () => {
    it('should add note successfully', async () => {
      const mockNote = {
        id: 'note-1',
        order_id: 'order-1',
        note: 'Test note content',
        created_by: 'admin-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnThis();
      mockSupabase.insert.mockResolvedValue({ data: mockNote, error: null });
      mockSupabase.select.mockReturnThis();
      mockSupabase.single.mockResolvedValue({ data: mockNote, error: null });

      const result = await addInternalNote('order-1', 'Test note content');

      expect(result.success).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: 'order-1',
          note: 'Test note content',
          created_by: 'admin-123',
        })
      );
    });

    it('should reject empty notes', async () => {
      const result = await addInternalNote('order-1', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject notes over 1000 characters', async () => {
      const longNote = 'a'.repeat(1001);
      const result = await addInternalNote('order-1', longNote);

      expect(result.success).toBe(false);
      expect(result.error).toContain('less than 1000 characters');
    });
  });

  describe('deleteInternalNote', () => {
    it('should delete note successfully', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await deleteInternalNote('order-1', 'note-1');

      expect(result.success).toBe(true);
      expect(mockSupabase.delete).toHaveBeenCalled();
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update multiple orders', async () => {
      const mockOrder1 = {
        id: 'order-1',
        status: 'pending',
        customer_id: null,
        order_number: 'LF-001',
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockOrder1, error: null })
        .mockResolvedValueOnce({ data: { ...mockOrder1, status: 'processing' as OrderStatus }, error: null });

      mockSupabase.from.mockReturnThis();
      mockSupabase.update.mockResolvedValue({ data: null, error: null });

      const result = await bulkUpdateStatus(['order-1'], 'processing' as OrderStatus);

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(1);
    });

    it('should handle empty order list', async () => {
      const result = await bulkUpdateStatus([], 'processing' as OrderStatus);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No orders selected');
    });

    it('should track failed updates', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Order not found' },
      });

      const result = await bulkUpdateStatus(['non-existent'], 'processing' as OrderStatus);

      expect(result.failedCount).toBe(1);
      expect(result.updatedCount).toBe(0);
    });
  });

  describe('exportOrdersToCSV', () => {
    it('should export orders to CSV format', async () => {
      const mockOrders = [
        {
          order_number: 'LF-001',
          created_at: '2025-01-15T10:00:00Z',
          customer_profiles: { full_name: 'John Doe', email: 'john@example.com' },
          status: 'shipped',
          total: 10000,
          payment_status: 'paid',
          shipping_address: { line1: '123 Main St', city: 'NYC' },
        },
      ];

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockResolvedValue({ data: mockOrders, error: null });

      const result = await exportOrdersToCSV();

      expect(result.success).toBe(true);
      expect(result.csvData).toContain('Order Number');
      expect(result.csvData).toContain('LF-001');
      expect(result.csvData).toContain('John Doe');
    });

    it('should filter by specific order IDs', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockResolvedValue({ data: [], error: null });

      await exportOrdersToCSV(['order-1', 'order-2']);

      expect(mockSupabase.in).toHaveBeenCalledWith('id', ['order-1', 'order-2']);
    });
  });

  describe('generatePackingSlip', () => {
    it('should generate packing slip for order', async () => {
      const mockOrder = {
        id: 'order-1',
        order_number: 'LF-001',
        customer_profiles: { full_name: 'John Doe', email: 'john@example.com' },
        order_items: [],
      };

      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockResolvedValue({ data: mockOrder, error: null });
      mockSupabase.single.mockResolvedValue({ data: mockOrder, error: null });

      const result = await generatePackingSlip('order-1');

      expect(result.success).toBe(true);
    });

    it('should handle order not found', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockResolvedValue({ data: null, error: { message: 'Order not found' } });
      mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Order not found' } });

      const result = await generatePackingSlip('non-existent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order not found');
    });
  });

  describe('bulkPrintPackingSlips', () => {
    it('should process bulk packing slip request', async () => {
      const result = await bulkPrintPackingSlips(['order-1', 'order-2']);

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    it('should reject empty order list', async () => {
      const result = await bulkPrintPackingSlips([]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No orders selected');
    });
  });
});

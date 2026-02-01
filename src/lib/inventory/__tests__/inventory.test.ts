/**
 * Inventory System Tests
 * Story 6.2: Inventory Management & Sync (Task 8)
 * 
 * Comprehensive test suite for inventory management functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  reserveInventory,
  releaseReservation,
  extendReservation,
  adjustInventory,
  convertReservationsToSales,
  createStockNotification,
  releaseExpiredReservations,
} from '@/lib/inventory/mutations';
import {
  getAvailableInventory,
  getCartReservations,
  checkStockStatus,
} from '@/lib/inventory/queries';

// Helper to create a mock function that can accept mockResolvedValueOnce
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMock(): any {
  return jest.fn();
}

// Create mock Supabase client
const createMockSupabase = () => ({
  rpc: createMock(),
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gt: createMock(),
    lt: createMock(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    single: createMock(),
    order: createMock(),
    range: jest.fn().mockReturnThis(),
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
  })),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSupabase: any = createMockSupabase();

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('Inventory System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createMockSupabase();
  });

  describe('reserveInventory', () => {
    it('should successfully reserve inventory when available', async () => {
      const mockResult = {
        success: true,
        reservation_id: 'res-123',
        message: 'Inventory reserved successfully',
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await reserveInventory('cart-1', 'prod-1', 'var-1', 5);

      expect(result.success).toBe(true);
      expect(result.reservation_id).toBe('res-123');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('reserve_inventory', {
        p_cart_id: 'cart-1',
        p_product_id: 'prod-1',
        p_variant_id: 'var-1',
        p_quantity: 5,
        p_expires_at: expect.any(String),
      });
    });

    it('should fail when inventory is insufficient', async () => {
      const mockResult = {
        success: false,
        error: 'INSUFFICIENT_INVENTORY',
        message: 'Insufficient inventory available',
        details: { requested: 10, available: 3 },
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await reserveInventory('cart-1', 'prod-1', null, 10);

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_INVENTORY');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const result = await reserveInventory('cart-1', 'prod-1', null, 5);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to reserve inventory');
    });
  });

  describe('releaseReservation', () => {
    it('should successfully release a reservation', async () => {
      const mockResult = {
        success: true,
        message: 'Reservation released successfully',
        quantity_released: 5,
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await releaseReservation('res-123', 'cancellation');

      expect(result.success).toBe(true);
      expect(result.quantity_released).toBe(5);
    });

    it('should handle reservation not found', async () => {
      const mockResult = {
        success: false,
        error: 'RESERVATION_NOT_FOUND',
        message: 'Reservation not found',
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await releaseReservation('invalid-id');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('extendReservation', () => {
    it('should extend reservation expiration time', async () => {
      const mockUpdate = createMock();
      mockUpdate.mockResolvedValueOnce({ error: null });
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        eq: jest.fn().mockReturnThis(),
      });

      const result = await extendReservation('res-123', 30);

      expect(result.success).toBe(true);
      expect(result.message).toContain('30 minutes');
    });
  });

  describe('adjustInventory', () => {
    it('should successfully adjust inventory quantity', async () => {
      const mockResult = {
        success: true,
        message: 'Inventory adjusted successfully',
        quantity_before: 100,
        quantity_after: 120,
        adjustment: 20,
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await adjustInventory('prod-1', null, 20, 'restock', 'admin');

      expect(result.success).toBe(true);
      expect(result.quantity_after).toBe(120);
    });

    it('should handle negative adjustments (sales)', async () => {
      const mockResult = {
        success: true,
        message: 'Inventory adjusted successfully',
        quantity_before: 100,
        quantity_after: 95,
        adjustment: -5,
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await adjustInventory('prod-1', null, -5, 'sale', 'checkout');

      expect(result.success).toBe(true);
      expect(result.quantity_after).toBe(95);
    });
  });

  describe('convertReservationsToSales', () => {
    it('should convert all reservations to sales after checkout', async () => {
      const mockReservations = [
        { id: 'res-1', product_id: 'prod-1', variant_id: null, quantity: 2 },
        { id: 'res-2', product_id: 'prod-2', variant_id: 'var-1', quantity: 1 },
      ];

      const mockGt = createMock();
      mockGt.mockResolvedValueOnce({ data: mockReservations, error: null });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: mockGt,
        delete: jest.fn().mockReturnThis(),
      });

      mockSupabase.rpc.mockResolvedValue({
        data: { success: true, message: 'Adjusted' },
        error: null,
      });

      const result = await convertReservationsToSales('cart-1', 'order-1');

      expect(result.processed).toBe(2);
    });
  });

  describe('createStockNotification', () => {
    it('should create a stock notification request', async () => {
      const mockInsert = createMock();
      mockInsert.mockResolvedValueOnce({ error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await createStockNotification({
        productId: 'prod-1',
        variantId: 'var-1',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        product_id: 'prod-1',
        variant_id: 'var-1',
        email: 'test@example.com',
        status: 'pending',
      });
    });

    it('should handle duplicate signups gracefully', async () => {
      const mockInsert = createMock();
      mockInsert.mockResolvedValueOnce({
        error: { message: 'unique constraint violation' },
      });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await createStockNotification({
        productId: 'prod-1',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('already on the notification list');
    });
  });

  describe('getAvailableInventory', () => {
    it('should return available inventory for a product', async () => {
      const mockInventory = {
        product_id: 'prod-1',
        variant_id: null,
        total_quantity: 100,
        reserved_quantity: 10,
        low_stock_threshold: 10,
      };

      const mockSingle = createMock();
      mockSingle.mockResolvedValueOnce({ data: mockInventory, error: null });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: mockSingle,
      });

      const { data, error } = await getAvailableInventory('prod-1');

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.available_quantity).toBe(90);
    });

    it('should return error when inventory not found', async () => {
      const mockSingle = createMock();
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        single: mockSingle,
      });

      const { data, error } = await getAvailableInventory('invalid-id');

      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });
  });

  describe('checkStockStatus', () => {
    it('should return correct stock status for in-stock item', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          is_low_stock: false,
          is_out_of_stock: false,
          available_quantity: 50,
          threshold: 10,
        },
        error: null,
      });

      const { data, error } = await checkStockStatus('prod-1');

      expect(error).toBeNull();
      expect(data?.isLowStock).toBe(false);
      expect(data?.isOutOfStock).toBe(false);
      expect(data?.available).toBe(50);
    });

    it('should return correct stock status for low stock item', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          is_low_stock: true,
          is_out_of_stock: false,
          available_quantity: 5,
          threshold: 10,
        },
        error: null,
      });

      const { data, error } = await checkStockStatus('prod-1');

      expect(error).toBeNull();
      expect(data?.isLowStock).toBe(true);
      expect(data?.isOutOfStock).toBe(false);
    });

    it('should return correct stock status for out of stock item', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          is_low_stock: false,
          is_out_of_stock: true,
          available_quantity: 0,
          threshold: 10,
        },
        error: null,
      });

      const { data, error } = await checkStockStatus('prod-1');

      expect(error).toBeNull();
      expect(data?.isLowStock).toBe(false);
      expect(data?.isOutOfStock).toBe(true);
    });
  });

  describe('getCartReservations', () => {
    it('should return active reservations for a cart', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          cart_id: 'cart-1',
          product_id: 'prod-1',
          quantity: 2,
          expires_at: '2026-12-31T23:59:59Z',
        },
      ];

      const mockOrder = createMock();
      mockOrder.mockResolvedValueOnce({ data: mockReservations, error: null });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        order: mockOrder,
      });

      const { data, error } = await getCartReservations('cart-1');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });
  });

  describe('releaseExpiredReservations', () => {
    it('should release all expired reservations', async () => {
      const mockExpiredReservations = [
        { id: 'res-1' },
        { id: 'res-2' },
      ];

      const mockLt = createMock();
      mockLt.mockResolvedValueOnce({ data: mockExpiredReservations, error: null });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lt: mockLt,
      });

      mockSupabase.rpc.mockResolvedValue({
        data: { success: true, message: 'Released' },
        error: null,
      });

      const result = await releaseExpiredReservations();

      expect(result.released).toBe(2);
      expect(result.error).toBeNull();
    });

    it('should handle no expired reservations', async () => {
      const mockLt = createMock();
      mockLt.mockResolvedValueOnce({ data: [], error: null });
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lt: mockLt,
      });

      const result = await releaseExpiredReservations();

      expect(result.released).toBe(0);
      expect(result.error).toBeNull();
    });
  });
});

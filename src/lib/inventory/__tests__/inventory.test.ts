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
        reservation_id: '550e8400-e29b-41d4-a716-446655440001',
        message: 'Inventory reserved successfully',
      };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: mockResult,
        error: null,
      });

      const result = await reserveInventory(
        '550e8400-e29b-41d4-a716-446655440002',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c9',
        5
      );

      expect(result.success).toBe(true);
      expect(result.reservation_id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(mockSupabase.rpc).toHaveBeenCalledWith('reserve_inventory', {
        p_cart_id: '550e8400-e29b-41d4-a716-446655440002',
        p_product_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        p_variant_id: '6ba7b811-9dad-11d1-80b4-00c04fd430c9',
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

      const result = await reserveInventory(
        '550e8400-e29b-41d4-a716-446655440002',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        null,
        10
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_INVENTORY');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const result = await reserveInventory(
        '550e8400-e29b-41d4-a716-446655440002',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        null,
        5
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Database connection failed');
    });

    it('should reject invalid UUID format', async () => {
      const result = await reserveInventory('invalid-id', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', null, 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_INPUT');
      expect(result.message).toContain('Invalid ID format');
    });

    it('should reject negative quantity', async () => {
      const result = await reserveInventory(
        '550e8400-e29b-41d4-a716-446655440002',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        null,
        -5
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_INPUT');
      expect(result.message).toContain('Quantity must be greater than 0');
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

      const result = await releaseReservation(
        '550e8400-e29b-41d4-a716-446655440001',
        'cancellation'
      );

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

      const result = await releaseReservation(
        '6ba7b812-9dad-11d1-80b4-00c04fd430ca'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should reject invalid UUID format', async () => {
      const result = await releaseReservation('not-a-uuid');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid ID format');
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

      const result = await extendReservation('6ba7b812-9dad-11d1-80b4-00c04fd430ca', 30);

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

      const result = await adjustInventory('6ba7b810-9dad-11d1-80b4-00c04fd430c8', null, 20, 'restock', 'admin');

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

      const result = await adjustInventory('6ba7b810-9dad-11d1-80b4-00c04fd430c8', null, -5, 'sale', 'checkout');

      expect(result.success).toBe(true);
      expect(result.quantity_after).toBe(95);
    });
  });

  describe('convertReservationsToSales', () => {
    it('should convert all reservations to sales after checkout', async () => {
      const mockReservations = [
        { id: '550e8400-e29b-41d4-a716-446655440001', product_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', variant_id: null, quantity: 2 },
        { id: '6ba7b812-9dad-11d1-80b4-00c04fd430ca', product_id: '6ba7b813-9dad-11d1-80b4-00c04fd430cb', variant_id: '6ba7b811-9dad-11d1-80b4-00c04fd430c9', quantity: 1 },
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

      const result = await convertReservationsToSales('550e8400-e29b-41d4-a716-446655440002', '6ba7b814-9dad-11d1-80b4-00c04fd430cc');

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
        productId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        variantId: '6ba7b811-9dad-11d1-80b4-00c04fd430c9',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith({
        product_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        variant_id: '6ba7b811-9dad-11d1-80b4-00c04fd430c9',
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
        productId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('already on the notification list');
    });
  });

  describe('getAvailableInventory', () => {
    it('should return available inventory for a product', async () => {
      const mockInventory = {
        product_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
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

      const { data, error } = await getAvailableInventory('6ba7b810-9dad-11d1-80b4-00c04fd430c8');

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

      const { data, error } = await checkStockStatus('6ba7b810-9dad-11d1-80b4-00c04fd430c8');

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

      const { data, error } = await checkStockStatus('6ba7b810-9dad-11d1-80b4-00c04fd430c8');

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

      const { data, error } = await checkStockStatus('6ba7b810-9dad-11d1-80b4-00c04fd430c8');

      expect(error).toBeNull();
      expect(data?.isLowStock).toBe(false);
      expect(data?.isOutOfStock).toBe(true);
    });
  });

  describe('getCartReservations', () => {
    it('should return active reservations for a cart', async () => {
      const mockReservations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          cart_id: '550e8400-e29b-41d4-a716-446655440002',
          product_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
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

      const { data, error } = await getCartReservations('550e8400-e29b-41d4-a716-446655440002');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });
  });

  describe('releaseExpiredReservations', () => {
    it('should release all expired reservations', async () => {
      const mockExpiredReservations = [
        { id: '550e8400-e29b-41d4-a716-446655440001' },
        { id: '6ba7b812-9dad-11d1-80b4-00c04fd430ca' },
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

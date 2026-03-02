/**
 * Real-Time Orders Hook Tests
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC2: Real-Time Order Updates
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useRealtimeOrders, useNewOrderNotifications } from '../use-realtime-orders';
import type { Order } from '@/types/database.types';

const mockSubscribeToOrders = jest.fn();
const mockSubscribeToNewOrders = jest.fn();

jest.mock('@/lib/supabase/realtime', () => ({
  subscribeToOrders: (...args: unknown[]) => mockSubscribeToOrders(...args),
  subscribeToNewOrders: (...args: unknown[]) => mockSubscribeToNewOrders(...args),
}));

describe('useRealtimeOrders', () => {
  const mockOrder: Order = {
    id: 'order-1',
    customer_id: 'customer-1',
    customer_email: 'test@example.com',
    status: 'pending',
    total: 10000,
    shipping_address: { name: 'Test User' },
    billing_address: null,
    email_sent: false,
    email_sent_at: null,
    email_error: null,
    ordered_at: new Date().toISOString(),
    production_started_at: null,
    quality_checked_at: null,
    shipped_at: null,
    delivered_at: null,
    production_stages: null,
    production_completion_estimate: null,
    qc_photo_url: null,
    tracking_number: null,
    carrier: null,
    estimated_delivery_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default mock implementations
    mockSubscribeToOrders.mockReturnValue(jest.fn());
    mockSubscribeToNewOrders.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with provided initial orders', () => {
    const initialOrders = [mockOrder];
    const { result } = renderHook(() => useRealtimeOrders(initialOrders, false));

    expect(result.current.orders).toEqual(initialOrders);
    expect(result.current.isConnected).toBe(false);
  });

  it('does not subscribe when realtime is disabled', () => {
    renderHook(() => useRealtimeOrders([], false));

    expect(mockSubscribeToOrders).not.toHaveBeenCalled();
    expect(mockSubscribeToNewOrders).not.toHaveBeenCalled();
  });

  it('subscribes when realtime is enabled', () => {
    renderHook(() => useRealtimeOrders([], true));

    expect(mockSubscribeToOrders).toHaveBeenCalled();
    expect(mockSubscribeToNewOrders).toHaveBeenCalled();
  });

  it('adds new orders via realtime with debouncing', async () => {
    let newOrderCallback: ((order: Order) => void) | null = null;
    mockSubscribeToNewOrders.mockImplementation((callback: (order: Order) => void) => {
      newOrderCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useRealtimeOrders([], true));

    // Simulate receiving a new order
    act(() => {
      newOrderCallback?.(mockOrder);
    });

    // Order should not be added immediately (debouncing)
    expect(result.current.orders).toHaveLength(0);

    // Advance past debounce time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].id).toBe('order-1');
    });
  });

  it('updates existing order on UPDATE event', async () => {
    let updateCallback: ((payload: { eventType: string; new: Order | null }) => void) | null = null;
    mockSubscribeToOrders.mockImplementation((callback: (payload: { eventType: string; new: Order | null }) => void) => {
      updateCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useRealtimeOrders([mockOrder], true));

    // Simulate an order update
    const updatedOrder = { ...mockOrder, status: 'production' };
    act(() => {
      updateCallback?.({ eventType: 'UPDATE', new: updatedOrder });
    });

    await waitFor(() => {
      expect(result.current.orders[0].status).toBe('production');
    });
  });

  it('limits orders to 10 maximum', async () => {
    let newOrderCallback: ((order: Order) => void) | null = null;
    mockSubscribeToNewOrders.mockImplementation((callback: (order: Order) => void) => {
      newOrderCallback = callback;
      return jest.fn();
    });

    const { result } = renderHook(() => useRealtimeOrders([], true));

    // Add 12 orders
    act(() => {
      for (let i = 0; i < 12; i++) {
        newOrderCallback?.({ ...mockOrder, id: `order-${i}` });
      }
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.orders).toHaveLength(10);
    });
  });

  it('unsubscribes on unmount', () => {
    const unsubscribeOrders = jest.fn();
    const unsubscribeNewOrders = jest.fn();

    mockSubscribeToOrders.mockReturnValue(unsubscribeOrders);
    mockSubscribeToNewOrders.mockReturnValue(unsubscribeNewOrders);

    const { unmount } = renderHook(() => useRealtimeOrders([], true));

    unmount();

    expect(unsubscribeOrders).toHaveBeenCalled();
    expect(unsubscribeNewOrders).toHaveBeenCalled();
  });
});

describe('useNewOrderNotifications', () => {
  const mockSubscribeToNewOrders = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('notifies on new order', () => {
    let newOrderCallback: ((order: Order) => void) | null = null;
    mockSubscribeToNewOrders.mockImplementation((callback: (order: Order) => void) => {
      newOrderCallback = callback;
      return jest.fn();
    });

    const onNewOrder = jest.fn();
    renderHook(() => useNewOrderNotifications(onNewOrder, true));

    const mockOrder = { id: 'order-1' } as Order;
    act(() => {
      newOrderCallback?.(mockOrder);
    });

    expect(onNewOrder).toHaveBeenCalledWith(mockOrder);
  });

  it('does not subscribe when disabled', () => {
    renderHook(() => useNewOrderNotifications(jest.fn(), false));
    expect(mockSubscribeToNewOrders).not.toHaveBeenCalled();
  });
});

/**
 * Connection Status Hook Tests
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC4: Real-Time Fallback Strategy
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useConnectionStatus } from '../use-connection-status';

// Mock Supabase client
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockLimit = jest.fn();
const mockRemoveChannel = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn((callback: (status: string) => void) => {
          callback('SUBSCRIBED');
          return { unsubscribe: jest.fn() };
        }),
      })),
      subscribe: jest.fn((callback: (status: string) => void) => {
        callback('SUBSCRIBED');
        return { unsubscribe: jest.fn() };
      }),
    })),
    removeChannel: mockRemoveChannel,
  }),
}));

describe('useConnectionStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Default mock for successful connection
    mockLimit.mockResolvedValue({ data: [{ id: '1' }], error: null });
    mockSelect.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with polling status', () => {
    const { result } = renderHook(() => useConnectionStatus());
    expect(result.current.status).toBe('polling');
  });

  it('checks connection on mount', async () => {
    renderHook(() => useConnectionStatus());

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    expect(mockFrom).toHaveBeenCalledWith('orders');
    expect(mockSelect).toHaveBeenCalledWith('id');
    expect(mockLimit).toHaveBeenCalledWith(1);
  });

  it('updates status to connected on successful connection', async () => {
    const { result } = renderHook(() => useConnectionStatus());

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('connected');
    });
  });

  it('increments retry count on failed connection', async () => {
    mockLimit.mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useConnectionStatus());

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(result.current.retryCount).toBeGreaterThan(0);
    });
  });

  it('polls connection status periodically', async () => {
    renderHook(() => useConnectionStatus());

    // Initial check on mount
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    const initialCallCount = mockFrom.mock.calls.length;

    // Advance past polling interval
    await act(async () => {
      jest.advanceTimersByTime(30000);
    });

    expect(mockFrom).toHaveBeenCalledTimes(initialCallCount + 1);
  });

  it('checkConnection returns true on success', async () => {
    const { result } = renderHook(() => useConnectionStatus());

    let checkResult: boolean | undefined;
    await act(async () => {
      checkResult = await result.current.checkConnection();
    });

    expect(checkResult).toBe(true);
  });

  it('checkConnection returns false on error', async () => {
    mockLimit.mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useConnectionStatus());

    let checkResult: boolean | undefined;
    await act(async () => {
      checkResult = await result.current.checkConnection();
    });

    expect(checkResult).toBe(false);
  });

  it('updates lastConnectedAt when connected', async () => {
    const { result } = renderHook(() => useConnectionStatus());

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('connected');
      expect(result.current.lastConnectedAt).not.toBeNull();
    });
  });
});

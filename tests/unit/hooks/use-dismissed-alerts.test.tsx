/**
 * Unit Tests: useDismissedAlerts Hook
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 */

import { renderHook, act } from '@testing-library/react';
import { useDismissedAlerts } from '@/hooks/use-dismissed-alerts';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useDismissedAlerts', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should start with empty dismissed IDs', () => {
    const { result } = renderHook(() => useDismissedAlerts());

    expect(result.current.dismissedIds).toEqual([]);
  });

  it('should dismiss a single alert', () => {
    const { result } = renderHook(() => useDismissedAlerts());

    act(() => {
      result.current.dismiss('alert-1');
    });

    expect(result.current.dismissedIds).toContain('alert-1');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dismissed_alerts',
      expect.stringContaining('alert-1')
    );
  });

  it('should dismiss all alerts for today', () => {
    const { result } = renderHook(() => useDismissedAlerts());

    act(() => {
      result.current.dismissAllToday();
    });

    expect(result.current.dismissedIds).toEqual(['all']);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dismissed_alerts_date',
      expect.any(String)
    );
  });

  it('should check if alert is dismissed', () => {
    const { result } = renderHook(() => useDismissedAlerts());

    act(() => {
      result.current.dismiss('alert-1');
    });

    expect(result.current.isDismissed('alert-1')).toBe(true);
    expect(result.current.isDismissed('alert-2')).toBe(false);
  });

  it('should clear all dismissals', () => {
    const { result } = renderHook(() => useDismissedAlerts());

    act(() => {
      result.current.dismiss('alert-1');
      result.current.dismiss('alert-2');
    });

    act(() => {
      result.current.clearDismissals();
    });

    expect(result.current.dismissedIds).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('dismissed_alerts');
  });

  it('should load dismissed alerts from localStorage on mount', () => {
    const today = new Date().toDateString();
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'dismissed_alerts') return JSON.stringify(['alert-1', 'alert-2']);
      if (key === 'dismissed_alerts_date') return today;
      return null;
    });

    const { result } = renderHook(() => useDismissedAlerts());

    expect(result.current.dismissedIds).toEqual(['alert-1', 'alert-2']);
  });

  it('should clear old dismissals from previous days', () => {
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'dismissed_alerts') return JSON.stringify(['alert-1']);
      if (key === 'dismissed_alerts_date') return 'Mon Jan 01 2024'; // Old date
      return null;
    });

    const { result } = renderHook(() => useDismissedAlerts());

    expect(result.current.dismissedIds).toEqual([]);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('dismissed_alerts');
  });

  // AC5: Per-alert "Don't show today" functionality
  it('should dismiss a specific alert for today', () => {
    const { result } = renderHook(() => useDismissedAlerts());

    act(() => {
      result.current.dismissForToday('alert-1');
    });

    expect(result.current.dismissedIds).toContain('alert-1');
    expect(result.current.isDismissed('alert-1')).toBe(true);
  });

  it('should persist daily dismissals to localStorage', () => {
    const { result } = renderHook(() => useDismissedAlerts());

    act(() => {
      result.current.dismissForToday('alert-2');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dismissed_alerts_daily',
      expect.stringContaining('alert-2')
    );
  });

  it('should load daily dismissals from localStorage on mount', () => {
    const today = new Date().toDateString();
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'dismissed_alerts_daily') return JSON.stringify(['alert-daily']);
      if (key === 'dismissed_alerts_date') return today;
      return null;
    });

    const { result } = renderHook(() => useDismissedAlerts());

    expect(result.current.dismissedIds).toContain('alert-daily');
  });
});

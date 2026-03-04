/**
 * useDismissedAlerts Hook
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 * AC5: Alert dismissal state management with localStorage persistence
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const DISMISSAL_KEY = 'dismissed_alerts';
const DISMISSAL_DATE_KEY = 'dismissed_alerts_date';
const DAILY_DISMISSAL_KEY = 'dismissed_alerts_daily'; // AC5: Per-alert daily dismissal

export function useDismissedAlerts() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [dailyDismissedIds, setDailyDismissedIds] = useState<string[]>([]); // AC5: Per-alert daily
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dismissed alerts from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(DISMISSAL_KEY);
    const savedDaily = localStorage.getItem(DAILY_DISMISSAL_KEY);
    const savedDate = localStorage.getItem(DISMISSAL_DATE_KEY);
    const today = new Date().toDateString();

    if (saved && savedDate === today) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setDismissedIds(parsed);
        }
      } catch (e) {
        console.error('Failed to parse dismissed alerts:', e);
      }
    } else {
      // Clear old dismissals (different day or corrupted)
      localStorage.removeItem(DISMISSAL_KEY);
      localStorage.removeItem(DAILY_DISMISSAL_KEY);
      localStorage.removeItem(DISMISSAL_DATE_KEY);
    }

    // AC5: Load per-alert daily dismissals
    if (savedDaily && savedDate === today) {
      try {
        const parsed = JSON.parse(savedDaily);
        if (Array.isArray(parsed)) {
          setDailyDismissedIds(parsed);
        }
      } catch (e) {
        console.error('Failed to parse daily dismissed alerts:', e);
      }
    }

    setIsLoaded(true);
  }, []);

  // Dismiss a single alert
  const dismiss = useCallback((alertId: string) => {
    if (typeof window === 'undefined') return;

    setDismissedIds((prev) => {
      const updated = [...prev, alertId];
      localStorage.setItem(DISMISSAL_KEY, JSON.stringify(updated));
      localStorage.setItem(DISMISSAL_DATE_KEY, new Date().toDateString());
      return updated;
    });
  }, []);

  // Dismiss all alerts for today
  const dismissAllToday = useCallback(() => {
    if (typeof window === 'undefined') return;

    const today = new Date().toDateString();
    localStorage.setItem(DISMISSAL_DATE_KEY, today);
    localStorage.setItem(DISMISSAL_KEY, JSON.stringify(['all']));
    setDismissedIds(['all']);
  }, []);

  // AC5: Dismiss a specific alert for today only
  const dismissForToday = useCallback((alertId: string) => {
    if (typeof window === 'undefined') return;

    setDailyDismissedIds((prev) => {
      const updated = [...prev, alertId];
      localStorage.setItem(DAILY_DISMISSAL_KEY, JSON.stringify(updated));
      localStorage.setItem(DISMISSAL_DATE_KEY, new Date().toDateString());
      return updated;
    });
  }, []);

  // Check if an alert is dismissed
  const isDismissed = useCallback(
    (alertId: string) => {
      if (!isLoaded) return false;
      return (
        dismissedIds.includes('all') ||
        dismissedIds.includes(alertId) ||
        dailyDismissedIds.includes(alertId)
      );
    },
    [dismissedIds, dailyDismissedIds, isLoaded]
  );

  // Clear all dismissals (e.g., on manual refresh)
  const clearDismissals = useCallback(() => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(DISMISSAL_KEY);
    localStorage.removeItem(DAILY_DISMISSAL_KEY);
    localStorage.removeItem(DISMISSAL_DATE_KEY);
    setDismissedIds([]);
    setDailyDismissedIds([]);
  }, []);

  return {
    dismissedIds: [...dismissedIds, ...dailyDismissedIds],
    dismiss,
    dismissAllToday,
    dismissForToday,
    isDismissed,
    clearDismissals,
    isLoaded,
  };
}

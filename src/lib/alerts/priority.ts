/**
 * Alert Priority Rules
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 * 
 * Determines priority levels for different alert types
 */

import { getInventoryPriority } from '@/lib/config/alerts';

export type AlertPriority = 'high' | 'medium';

export interface LowInventoryProduct {
  id: string;
  name: string;
  quantity: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  created_at: string;
}

/**
 * Calculate priority for low inventory alerts
 * HIGH: Any product at 0 quantity (out of stock)
 * MEDIUM: Products below threshold but not zero
 */
export function getLowInventoryPriority(
  products: LowInventoryProduct[]
): AlertPriority {
  if (products.some((p) => p.quantity === 0)) return 'high';
  return 'medium';
}

/**
 * Calculate priority for support ticket alerts
 * HIGH: Any ticket older than 24 hours
 * MEDIUM: All tickets less than 24 hours old
 */
export function getSupportTicketPriority(
  tickets: SupportTicket[]
): AlertPriority {
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const now = Date.now();

  const oldTickets = tickets.filter(
    (t) => now - new Date(t.created_at).getTime() > twentyFourHoursMs
  );

  return oldTickets.length > 0 ? 'high' : 'medium';
}

/**
 * Priority for pending returns (always MEDIUM)
 */
export function getPendingReturnsPriority(): AlertPriority {
  return 'medium';
}

/**
 * Priority for failed payments (always HIGH)
 */
export function getFailedPaymentsPriority(): AlertPriority {
  return 'high';
}

/**
 * Sort alerts by priority and count
 * HIGH priority first, then by count descending
 */
export function sortAlerts<T extends { priority: AlertPriority; count: number }>(
  alerts: T[]
): T[] {
  return alerts.sort((a, b) => {
    // First by priority (high > medium)
    if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : 1;
    }
    // Then by count (descending)
    return b.count - a.count;
  });
}

/**
 * Alert Configuration
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 */

/**
 * Low inventory threshold - products below this quantity trigger alerts
 * Configured via environment variable LOW_INVENTORY_THRESHOLD
 * Default: 5 units
 */
export const LOW_INVENTORY_THRESHOLD = parseInt(
  process.env.LOW_INVENTORY_THRESHOLD || '5',
  10
);

/**
 * Alert polling interval in milliseconds (fallback when realtime disabled)
 * Default: 60 seconds
 */
export const ALERT_POLLING_INTERVAL = parseInt(
  process.env.ALERT_POLLING_INTERVAL || '60000',
  10
);

/**
 * Whether realtime alerts are enabled
 * Default: true
 */
export const ALERT_REALTIME_ENABLED =
  process.env.ALERT_REALTIME_ENABLED !== 'false';

/**
 * Validate configuration on startup
 */
export function validateAlertConfig(): void {
  if (isNaN(LOW_INVENTORY_THRESHOLD) || LOW_INVENTORY_THRESHOLD < 0) {
    throw new Error('LOW_INVENTORY_THRESHOLD must be a positive integer');
  }

  if (isNaN(ALERT_POLLING_INTERVAL) || ALERT_POLLING_INTERVAL < 1000) {
    throw new Error('ALERT_POLLING_INTERVAL must be at least 1000ms');
  }
}

/**
 * Get inventory priority based on quantity
 * @param quantity - Current inventory quantity
 * @returns 'high' if out of stock, 'medium' if below threshold, null otherwise
 */
export function getInventoryPriority(
  quantity: number
): 'high' | 'medium' | null {
  if (quantity === 0) return 'high';
  if (quantity < LOW_INVENTORY_THRESHOLD) return 'medium';
  return null;
}

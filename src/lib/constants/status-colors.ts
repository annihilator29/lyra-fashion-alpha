/**
 * Order Status Color Constants
 * Story 7.1b: Admin Dashboard - Data Visualization
 */

export const ORDER_STATUS_COLORS = {
  pending: '#F59E0B', // Amber
  paid: '#059669', // Emerald
  production: '#3B82F6', // Blue
  quality_check: '#8B5CF6', // Purple
  shipped: '#6366F1', // Indigo
  delivered: '#10B981', // Green
  cancelled: '#EF4444', // Red
} as const;

export type OrderStatusColor = keyof typeof ORDER_STATUS_COLORS;

export const getStatusColor = (status: string): string => {
  return ORDER_STATUS_COLORS[status as OrderStatusColor] ?? '#9CA3AF'; // Default gray
};

// Simple status labels for visualization purposes
export const STATUS_LABELS_FOR_CHARTS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  production: 'In Production',
  quality_check: 'Quality Check',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

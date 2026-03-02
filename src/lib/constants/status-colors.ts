/**
 * Order Status Color Constants
 * Story 7.1b: Admin Dashboard - Data Visualization
 */

export const ORDER_STATUS_COLORS = {
  pending: '#F59E0B', // Amber
  processing: '#3B82F6', // Blue
  shipped: '#6366F1', // Indigo
  delivered: '#10B981', // Green
  cancelled: '#EF4444', // Red
  refunded: '#6B7280', // Gray
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_COLORS;

export const getStatusColor = (status: string): string => {
  return ORDER_STATUS_COLORS[status as OrderStatus] ?? '#9CA3AF'; // Default gray
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

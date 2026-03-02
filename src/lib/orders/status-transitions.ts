/**
 * Order Status Transition Rules
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC5: Order Status Management
 */

import type { OrderStatus } from '@/types/order';

/**
 * Valid status transitions map
 * Defines which statuses can transition to which other statuses
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['production', 'cancelled'],
  production: ['quality_check', 'cancelled'],
  quality_check: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * All valid order statuses
 */
export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'production',
  'quality_check',
  'shipped',
  'delivered',
  'cancelled',
];

/**
 * Terminal statuses (cannot transition to any other status)
 */
export const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'cancelled'];

/**
 * Status labels for display
 */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  production: 'In Production',
  quality_check: 'Quality Check',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export interface StatusValidationResult {
  valid: boolean;
  warning?: string;
  error?: string;
}

/**
 * Validate if a status transition is allowed
 * @param currentStatus - Current order status
 * @param newStatus - Desired new status
 * @returns Validation result with optional warning/error message
 */
export function validateStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): StatusValidationResult {
  // Same status is always valid (no change needed)
  if (currentStatus === newStatus) {
    return { valid: true };
  }

  // Any status can go to cancelled
  if (newStatus === 'cancelled') {
    return { valid: true };
  }

  // Check normal flow
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  if (allowedTransitions?.includes(newStatus)) {
    return { valid: true };
  }

  // Invalid transition
  return {
    valid: false,
    error: `Cannot change status from ${STATUS_LABELS[currentStatus]} to ${STATUS_LABELS[newStatus]}`,
  };
}

/**
 * Get the next valid statuses from current status
 * @param currentStatus - Current order status
 * @returns Array of valid next statuses
 */
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if status is terminal (cannot be changed)
 * @param status - Order status to check
 * @returns True if status is terminal
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Get all available status options for a dropdown
 * Includes warning indicators for potentially problematic transitions
 */
export function getStatusOptions(
  currentStatus: OrderStatus
): Array<{
  value: OrderStatus;
  label: string;
  isValid: boolean;
  warning?: string;
}> {
  return ALL_ORDER_STATUSES.map((status) => {
    const validation = validateStatusTransition(currentStatus, status);
    return {
      value: status,
      label: STATUS_LABELS[status],
      isValid: validation.valid,
      warning: validation.warning,
    };
  });
}

/**
 * Determine if a status change requires confirmation
 * @param currentStatus - Current order status
 * @param newStatus - Proposed new status
 * @returns True if confirmation should be shown
 */
export function requiresConfirmation(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  // Always confirm cancellation
  if (newStatus === 'cancelled') {
    return true;
  }

  // Confirm transition from delivered (rare case)
  if (currentStatus === 'delivered') {
    return true;
  }

  return false;
}

/**
 * Get confirmation message for status change
 * @param currentStatus - Current order status
 * @param newStatus - Proposed new status
 * @returns Confirmation message to display
 */
export function getConfirmationMessage(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): string {
  if (newStatus === 'cancelled') {
    return `Are you sure you want to cancel this order? This action cannot be undone.`;
  }

  if (currentStatus === 'delivered') {
    return `This order has already been delivered. Are you sure you want to change its status?`;
  }

  const validation = validateStatusTransition(currentStatus, newStatus);
  if (validation.warning) {
    return validation.warning;
  }

  return `Change order status from ${STATUS_LABELS[currentStatus]} to ${STATUS_LABELS[newStatus]}?`;
}

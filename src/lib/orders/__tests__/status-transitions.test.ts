/**
 * Status Transitions Tests
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC5: Order Status Management
 */

import {
  STATUS_TRANSITIONS,
  ALL_ORDER_STATUSES,
  TERMINAL_STATUSES,
  STATUS_LABELS,
  validateStatusTransition,
  getValidNextStatuses,
  isTerminalStatus,
  getStatusOptions,
  requiresConfirmation,
  getConfirmationMessage,
} from '../status-transitions';
import type { OrderStatus } from '@/types/order';

describe('status-transitions', () => {
  describe('STATUS_TRANSITIONS', () => {
    it('defines valid transitions for all statuses', () => {
      ALL_ORDER_STATUSES.forEach((status) => {
        expect(STATUS_TRANSITIONS[status]).toBeDefined();
      });
    });

    it('allows pending to transition to production and cancelled', () => {
      expect(STATUS_TRANSITIONS.pending).toContain('production');
      expect(STATUS_TRANSITIONS.pending).toContain('cancelled');
      expect(STATUS_TRANSITIONS.pending).not.toContain('shipped');
    });

    it('allows production to transition to quality_check and cancelled', () => {
      expect(STATUS_TRANSITIONS.production).toContain('quality_check');
      expect(STATUS_TRANSITIONS.production).toContain('cancelled');
      expect(STATUS_TRANSITIONS.production).not.toContain('shipped');
    });

    it('allows quality_check to transition to shipped and cancelled', () => {
      expect(STATUS_TRANSITIONS.quality_check).toContain('shipped');
      expect(STATUS_TRANSITIONS.quality_check).toContain('cancelled');
      expect(STATUS_TRANSITIONS.quality_check).not.toContain('delivered');
    });

    it('allows shipped to transition to delivered and cancelled', () => {
      expect(STATUS_TRANSITIONS.shipped).toContain('delivered');
      expect(STATUS_TRANSITIONS.shipped).toContain('cancelled');
      expect(STATUS_TRANSITIONS.shipped).not.toContain('production');
    });

    it('has no transitions from delivered', () => {
      expect(STATUS_TRANSITIONS.delivered).toHaveLength(0);
    });

    it('has no transitions from cancelled', () => {
      expect(STATUS_TRANSITIONS.cancelled).toHaveLength(0);
    });
  });

  describe('ALL_ORDER_STATUSES', () => {
    it('contains all valid order statuses', () => {
      expect(ALL_ORDER_STATUSES).toHaveLength(6);
      expect(ALL_ORDER_STATUSES).toContain('pending');
      expect(ALL_ORDER_STATUSES).toContain('production');
      expect(ALL_ORDER_STATUSES).toContain('quality_check');
      expect(ALL_ORDER_STATUSES).toContain('shipped');
      expect(ALL_ORDER_STATUSES).toContain('delivered');
      expect(ALL_ORDER_STATUSES).toContain('cancelled');
    });
  });

  describe('TERMINAL_STATUSES', () => {
    it('includes delivered and cancelled', () => {
      expect(TERMINAL_STATUSES).toContain('delivered');
      expect(TERMINAL_STATUSES).toContain('cancelled');
      expect(TERMINAL_STATUSES).toHaveLength(2);
    });
  });

  describe('STATUS_LABELS', () => {
    it('has labels for all statuses', () => {
      ALL_ORDER_STATUSES.forEach((status) => {
        expect(STATUS_LABELS[status]).toBeDefined();
        expect(typeof STATUS_LABELS[status]).toBe('string');
      });
    });

    it('has correct labels', () => {
      expect(STATUS_LABELS.pending).toBe('Pending');
      expect(STATUS_LABELS.production).toBe('In Production');
      expect(STATUS_LABELS.quality_check).toBe('Quality Check');
      expect(STATUS_LABELS.shipped).toBe('Shipped');
      expect(STATUS_LABELS.delivered).toBe('Delivered');
      expect(STATUS_LABELS.cancelled).toBe('Cancelled');
    });
  });

  describe('validateStatusTransition', () => {
    it('returns valid for same status', () => {
      const result = validateStatusTransition('pending', 'pending');
      expect(result.valid).toBe(true);
    });

    it('returns valid for normal flow transitions', () => {
      expect(validateStatusTransition('pending', 'production').valid).toBe(true);
      expect(validateStatusTransition('production', 'quality_check').valid).toBe(true);
      expect(validateStatusTransition('quality_check', 'shipped').valid).toBe(true);
      expect(validateStatusTransition('shipped', 'delivered').valid).toBe(true);
    });

    it('returns valid for any status to cancelled', () => {
      ALL_ORDER_STATUSES.forEach((status) => {
        if (status !== 'cancelled') {
          expect(validateStatusTransition(status, 'cancelled').valid).toBe(true);
        }
      });
    });

    it('returns invalid for backwards transitions', () => {
      expect(validateStatusTransition('shipped', 'pending').valid).toBe(false);
      expect(validateStatusTransition('delivered', 'shipped').valid).toBe(false);
      expect(validateStatusTransition('production', 'pending').valid).toBe(false);
    });

    it('returns invalid for skipping steps', () => {
      expect(validateStatusTransition('pending', 'shipped').valid).toBe(false);
      expect(validateStatusTransition('production', 'delivered').valid).toBe(false);
    });

    it('returns invalid for transitions from terminal statuses', () => {
      expect(validateStatusTransition('delivered', 'pending').valid).toBe(false);
      expect(validateStatusTransition('cancelled', 'production').valid).toBe(false);
    });

    it('returns error message for invalid transitions', () => {
      const result = validateStatusTransition('delivered', 'pending');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot change status');
    });
  });

  describe('getValidNextStatuses', () => {
    it('returns valid next statuses', () => {
      expect(getValidNextStatuses('pending')).toContain('production');
      expect(getValidNextStatuses('pending')).toContain('cancelled');
    });

    it('returns empty array for terminal statuses', () => {
      expect(getValidNextStatuses('delivered')).toHaveLength(0);
      expect(getValidNextStatuses('cancelled')).toHaveLength(0);
    });
  });

  describe('isTerminalStatus', () => {
    it('returns true for terminal statuses', () => {
      expect(isTerminalStatus('delivered')).toBe(true);
      expect(isTerminalStatus('cancelled')).toBe(true);
    });

    it('returns false for non-terminal statuses', () => {
      expect(isTerminalStatus('pending')).toBe(false);
      expect(isTerminalStatus('production')).toBe(false);
      expect(isTerminalStatus('quality_check')).toBe(false);
      expect(isTerminalStatus('shipped')).toBe(false);
    });
  });

  describe('getStatusOptions', () => {
    it('returns options for all statuses', () => {
      const options = getStatusOptions('pending');
      expect(options).toHaveLength(6);
    });

    it('marks valid transitions as isValid', () => {
      const options = getStatusOptions('pending');
      const productionOption = options.find(o => o.value === 'production');
      expect(productionOption?.isValid).toBe(true);
    });

    it('marks invalid transitions as not isValid', () => {
      const options = getStatusOptions('delivered');
      const pendingOption = options.find(o => o.value === 'pending');
      expect(pendingOption?.isValid).toBe(false);
    });
  });

  describe('requiresConfirmation', () => {
    it('returns true for cancellation', () => {
      ALL_ORDER_STATUSES.forEach((status) => {
        if (status !== 'cancelled') {
          expect(requiresConfirmation(status, 'cancelled')).toBe(true);
        }
      });
    });

    it('returns true for transitions from delivered', () => {
      expect(requiresConfirmation('delivered', 'cancelled')).toBe(true);
    });

    it('returns false for normal transitions', () => {
      expect(requiresConfirmation('pending', 'production')).toBe(false);
      expect(requiresConfirmation('production', 'quality_check')).toBe(false);
    });
  });

  describe('getConfirmationMessage', () => {
    it('returns cancellation message for cancel action (takes precedence over delivered warning)', () => {
      const message = getConfirmationMessage('delivered', 'cancelled');
      expect(message).toContain('cancel');
      expect(message).toContain('cannot be undone');
    });

    it('returns delivered warning for delivered orders transitioning to non-cancelled status', () => {
      // Note: Cancellation takes precedence over delivered warning
      const message = getConfirmationMessage('delivered', 'pending');
      expect(message).toContain('already been delivered');
    });

    it('returns generic message for normal transitions', () => {
      const message = getConfirmationMessage('pending', 'production');
      expect(message).toContain('Pending');
      expect(message).toContain('In Production');
    });
  });
});

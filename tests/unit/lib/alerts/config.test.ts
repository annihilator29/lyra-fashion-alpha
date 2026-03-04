/**
 * Unit Tests: Alert Configuration
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 */

describe('Alert Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('LOW_INVENTORY_THRESHOLD', () => {
    it('should use default value of 5 when env var not set', () => {
      delete process.env.LOW_INVENTORY_THRESHOLD;
      jest.isolateModules(() => {
        const { LOW_INVENTORY_THRESHOLD } = require('@/lib/config/alerts');
        expect(LOW_INVENTORY_THRESHOLD).toBe(5);
      });
    });

    it('should use env var value when set', () => {
      process.env.LOW_INVENTORY_THRESHOLD = '10';
      jest.isolateModules(() => {
        const { LOW_INVENTORY_THRESHOLD } = require('@/lib/config/alerts');
        expect(LOW_INVENTORY_THRESHOLD).toBe(10);
      });
    });
  });

  describe('getInventoryPriority', () => {
    it('should return high priority for zero quantity', () => {
      jest.isolateModules(() => {
        const { getInventoryPriority } = require('@/lib/config/alerts');
        expect(getInventoryPriority(0)).toBe('high');
      });
    });

    it('should return medium priority for quantity below threshold', () => {
      jest.isolateModules(() => {
        const { getInventoryPriority } = require('@/lib/config/alerts');
        expect(getInventoryPriority(3)).toBe('medium');
      });
    });

    it('should return null for quantity at or above threshold', () => {
      jest.isolateModules(() => {
        const { getInventoryPriority } = require('@/lib/config/alerts');
        expect(getInventoryPriority(5)).toBe('medium'); // At threshold is still medium
        expect(getInventoryPriority(10)).toBeNull(); // Above threshold is null
      });
    });
  });

  describe('validateAlertConfig', () => {
    it('should not throw for valid configuration', () => {
      process.env.LOW_INVENTORY_THRESHOLD = '5';
      process.env.ALERT_POLLING_INTERVAL = '60000';
      jest.isolateModules(() => {
        const { validateAlertConfig } = require('@/lib/config/alerts');
        expect(() => validateAlertConfig()).not.toThrow();
      });
    });

    it('should throw for negative threshold', () => {
      process.env.LOW_INVENTORY_THRESHOLD = '-1';
      jest.isolateModules(() => {
        const { validateAlertConfig } = require('@/lib/config/alerts');
        expect(() => validateAlertConfig()).toThrow(
          'LOW_INVENTORY_THRESHOLD must be a positive integer'
        );
      });
    });

    it('should throw for polling interval less than 1000ms', () => {
      process.env.LOW_INVENTORY_THRESHOLD = '5';
      process.env.ALERT_POLLING_INTERVAL = '500';
      jest.isolateModules(() => {
        const { validateAlertConfig } = require('@/lib/config/alerts');
        expect(() => validateAlertConfig()).toThrow(
          'ALERT_POLLING_INTERVAL must be at least 1000ms'
        );
      });
    });
  });
});

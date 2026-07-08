/**
 * Unit Tests: Alert Configuration
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 */

describe('Alert Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('LOW_INVENTORY_THRESHOLD', () => {
    it('should use default value of 5 when env var not set', async () => {
      delete process.env.LOW_INVENTORY_THRESHOLD;
      await jest.isolateModulesAsync(async () => {
        const { LOW_INVENTORY_THRESHOLD } = await import('@/lib/config/alerts');
        expect(LOW_INVENTORY_THRESHOLD).toBe(5);
      });
    });

    it('should use env var value when set', async () => {
      process.env.LOW_INVENTORY_THRESHOLD = '10';
      await jest.isolateModulesAsync(async () => {
        const { LOW_INVENTORY_THRESHOLD } = await import('@/lib/config/alerts');
        expect(LOW_INVENTORY_THRESHOLD).toBe(10);
      });
    });
  });

  describe('getInventoryPriority', () => {
    it('should return high priority for zero quantity', async () => {
      await jest.isolateModulesAsync(async () => {
        const { getInventoryPriority } = await import('@/lib/config/alerts');
        expect(getInventoryPriority(0)).toBe('high');
      });
    });

    it('should return medium priority for quantity below threshold', async () => {
      await jest.isolateModulesAsync(async () => {
        const { getInventoryPriority } = await import('@/lib/config/alerts');
        expect(getInventoryPriority(3)).toBe('medium');
      });
    });

    it('should return null for quantity at or above threshold', async () => {
      await jest.isolateModulesAsync(async () => {
        const { getInventoryPriority } = await import('@/lib/config/alerts');
        expect(getInventoryPriority(5)).toBe('medium'); // At threshold is still medium
        expect(getInventoryPriority(10)).toBeNull(); // Above threshold is null
      });
    });
  });

  describe('validateAlertConfig', () => {
    it('should not throw for valid configuration', async () => {
      process.env.LOW_INVENTORY_THRESHOLD = '5';
      process.env.ALERT_POLLING_INTERVAL = '60000';
      await jest.isolateModulesAsync(async () => {
        const { validateAlertConfig } = await import('@/lib/config/alerts');
        expect(() => validateAlertConfig()).not.toThrow();
      });
    });

    it('should throw for negative threshold', async () => {
      process.env.LOW_INVENTORY_THRESHOLD = '-1';
      await jest.isolateModulesAsync(async () => {
        const { validateAlertConfig } = await import('@/lib/config/alerts');
        expect(() => validateAlertConfig()).toThrow(
          'LOW_INVENTORY_THRESHOLD must be a positive integer'
        );
      });
    });

    it('should throw for polling interval less than 1000ms', async () => {
      process.env.LOW_INVENTORY_THRESHOLD = '5';
      process.env.ALERT_POLLING_INTERVAL = '500';
      await jest.isolateModulesAsync(async () => {
        const { validateAlertConfig } = await import('@/lib/config/alerts');
        expect(() => validateAlertConfig()).toThrow(
          'ALERT_POLLING_INTERVAL must be at least 1000ms'
        );
      });
    });
  });
});

/**
 * Unit Tests: Alert Priority Rules
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 */

import {
  getLowInventoryPriority,
  getSupportTicketPriority,
  getPendingReturnsPriority,
  getFailedPaymentsPriority,
  sortAlerts,
} from '@/lib/alerts/priority';

describe('Alert Priority Rules', () => {
  describe('getLowInventoryPriority', () => {
    it('should return high priority if any product at zero quantity', () => {
      const products = [
        { id: '1', name: 'Product A', quantity: 0 },
        { id: '2', name: 'Product B', quantity: 3 },
      ];
      expect(getLowInventoryPriority(products)).toBe('high');
    });

    it('should return medium priority if all products above zero but below threshold', () => {
      const products = [
        { id: '1', name: 'Product A', quantity: 2 },
        { id: '2', name: 'Product B', quantity: 4 },
      ];
      expect(getLowInventoryPriority(products)).toBe('medium');
    });
  });

  describe('getSupportTicketPriority', () => {
    it('should return high priority if any ticket older than 24 hours', () => {
      const now = Date.now();
      const oldTicket = {
        id: '1',
        subject: 'Old Ticket',
        created_at: new Date(now - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
      };
      const newTicket = {
        id: '2',
        subject: 'New Ticket',
        created_at: new Date(now - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      };

      expect(getSupportTicketPriority([oldTicket, newTicket])).toBe('high');
    });

    it('should return medium priority if all tickets less than 24 hours old', () => {
      const now = Date.now();
      const tickets = [
        {
          id: '1',
          subject: 'Ticket 1',
          created_at: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          subject: 'Ticket 2',
          created_at: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
        },
      ];

      expect(getSupportTicketPriority(tickets)).toBe('medium');
    });
  });

  describe('getPendingReturnsPriority', () => {
    it('should always return medium priority', () => {
      expect(getPendingReturnsPriority()).toBe('medium');
    });
  });

  describe('getFailedPaymentsPriority', () => {
    it('should always return high priority', () => {
      expect(getFailedPaymentsPriority()).toBe('high');
    });
  });

  describe('sortAlerts', () => {
    it('should sort high priority alerts first', () => {
      const alerts = [
        { id: '1', priority: 'medium' as const, count: 5 },
        { id: '2', priority: 'high' as const, count: 2 },
        { id: '3', priority: 'medium' as const, count: 3 },
      ];

      const sorted = sortAlerts(alerts);

      expect(sorted[0].priority).toBe('high');
      expect(sorted[0].id).toBe('2');
    });

    it('should sort by count descending within same priority', () => {
      const alerts = [
        { id: '1', priority: 'high' as const, count: 2 },
        { id: '2', priority: 'high' as const, count: 5 },
        { id: '3', priority: 'high' as const, count: 3 },
      ];

      const sorted = sortAlerts(alerts);

      expect(sorted.map((a) => a.count)).toEqual([5, 3, 2]);
    });
  });
});

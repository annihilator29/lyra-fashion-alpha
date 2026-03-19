/**
 * Activity Timeline Component Tests
 * Story 7.4c: Customer Activity Timeline
 *
 * Tests for the activity timeline UI component:
 * - Renders activities correctly
 * - Date grouping (Today, Yesterday, etc.)
 * - Activity type icons and labels
 * - Filter bar functionality
 * - Empty state handling
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

declare module '@jest/expect' {
  interface Matchers<R> {
    toBeInTheDocument(): R;
  }
}

// Mock the server action
jest.mock('@/app/admin/customers/activity-actions', () => ({
  getCustomerActivityTimeline: jest.fn(),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Import the mock so we can configure it
import { getCustomerActivityTimeline } from '@/app/admin/customers/activity-actions';
const mockGetTimeline = jest.mocked(getCustomerActivityTimeline);

describe('ActivityTimeline Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: return empty result for subsequent fetches
    mockGetTimeline.mockResolvedValue({
      activities: [],
      total: 0,
      hasMore: false,
    });
  });

  it('should render activity timeline heading', async () => {
    const { ActivityTimeline } = await import('../activity-timeline');

    await act(async () => {
      render(
        <ActivityTimeline
          customerId="cust-1"
          initialActivities={[]}
          initialTotal={0}
        />
      );
    });

    expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
  });

  it('should render initial activities with labels', async () => {
    const { ActivityTimeline } = await import('../activity-timeline');

    const mockActivities = [
      {
        id: 'act-1',
        customer_id: 'cust-1',
        activity_type: 'order_placed' as const,
        activity_data: { order_id: 'ord-1', order_number: 'ORD-001', total: 5000 },
        created_at: new Date().toISOString(),
      },
    ];

    await act(async () => {
      render(
        <ActivityTimeline
          customerId="cust-1"
          initialActivities={mockActivities}
          initialTotal={1}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Order Placed')).toBeInTheDocument();
    });
  });

  it('should display empty state when no activities', async () => {
    const { ActivityTimeline } = await import('../activity-timeline');

    // Make the fetch return empty so useEffect doesn't interfere
    mockGetTimeline.mockResolvedValue({
      activities: [],
      total: 0,
      hasMore: false,
    });

    await act(async () => {
      render(
        <ActivityTimeline
          customerId="cust-1"
          initialActivities={[]}
          initialTotal={0}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('No activities found.')).toBeInTheDocument();
    });
  });

  it('should render all activity type labels', async () => {
    const { ActivityTimeline } = await import('../activity-timeline');

    const now = new Date();
    const types = [
      'order_placed',
      'order_shipped',
      'order_delivered',
      'order_returned',
      'ticket_created',
      'ticket_status_changed',
      'ticket_resolved',
      'email_sent',
      'address_added',
      'address_updated',
      'preference_updated',
    ] as const;

    const mockActivities = types.map((type, i) => ({
      id: `act-${i}`,
      customer_id: 'cust-1',
      activity_type: type,
      activity_data: {},
      created_at: new Date(now.getTime() - i * 1000).toISOString(),
    }));

    // Prevent useEffect refetch from clearing the data
    mockGetTimeline.mockResolvedValue({
      activities: mockActivities,
      total: types.length,
      hasMore: false,
    });

    await act(async () => {
      render(
        <ActivityTimeline
          customerId="cust-1"
          initialActivities={mockActivities}
          initialTotal={types.length}
        />
      );
    });

    await waitFor(() => {
      // Use getAllByText since labels appear both in filter buttons and timeline items
      expect(screen.getAllByText('Order Placed').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Order Shipped').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Order Delivered').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Order Returned').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Ticket Created').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Ticket Status Changed').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Ticket Resolved').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Email Sent').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Address Added').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Address Updated').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Preference Updated').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should render the filter bar with All button', async () => {
    const { ActivityTimeline } = await import('../activity-timeline');

    await act(async () => {
      render(
        <ActivityTimeline
          customerId="cust-1"
          initialActivities={[]}
          initialTotal={0}
        />
      );
    });

    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('should display count when activities exist', async () => {
    const { ActivityTimeline } = await import('../activity-timeline');

    const mockActivities = [
      {
        id: 'act-1',
        customer_id: 'cust-1',
        activity_type: 'order_placed' as const,
        activity_data: {},
        created_at: new Date().toISOString(),
      },
    ];

    mockGetTimeline.mockResolvedValue({
      activities: mockActivities,
      total: 10,
      hasMore: true,
    });

    await act(async () => {
      render(
        <ActivityTimeline
          customerId="cust-1"
          initialActivities={mockActivities}
          initialTotal={10}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Showing 1 of 10 activities')).toBeInTheDocument();
    });
  });
});

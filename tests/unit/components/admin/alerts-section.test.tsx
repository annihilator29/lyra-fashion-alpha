/**
 * Unit Tests: Alerts Section Component
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 * AC5: Alert collection display with priority ordering and dismissal
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { AlertsSection, Alert } from '@/components/admin/alerts-section';

describe('AlertsSection', () => {
  const createMockAlerts = (count: number): Alert[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `alert-${i}`,
      type: i % 2 === 0 ? 'low-inventory' : 'pending-returns',
      count: i + 1,
      priority: i % 3 === 0 ? 'high' : 'medium',
      items: [],
      actionLink: '/admin/test',
      actionLabel: 'Test Action',
    }));
  };

  it('should render empty state when no alerts', () => {
    render(
      <AlertsSection
        alerts={[]}
        dismissedAlertIds={[]}
        onDismiss={jest.fn()}
      />
    );

    expect(screen.getByText('All caught up!')).toBeInTheDocument();
  });

  it('should show correct alert count in header', () => {
    const alerts = createMockAlerts(3);
    render(
      <AlertsSection
        alerts={alerts}
        dismissedAlertIds={[]}
        onDismiss={jest.fn()}
      />
    );

    expect(screen.getByText('Alerts (3)')).toBeInTheDocument();
  });

  it('should filter out dismissed alerts', () => {
    const alerts = createMockAlerts(3);
    render(
      <AlertsSection
        alerts={alerts}
        dismissedAlertIds={['alert-0', 'alert-1']}
        onDismiss={jest.fn()}
      />
    );

    expect(screen.getByText('Alerts (1)')).toBeInTheDocument();
  });

  it('should show dismiss all button when more than 1 alert', () => {
    const alerts = createMockAlerts(3);
    const mockDismissAll = jest.fn();
    render(
      <AlertsSection
        alerts={alerts}
        dismissedAlertIds={[]}
        onDismiss={jest.fn()}
        onDismissAllToday={mockDismissAll}
      />
    );

    expect(screen.getByText('Dismiss all for today')).toBeInTheDocument();
  });

  // AC5: Show max 4 alerts with "+N more" button
  it('should show only 4 alerts when more than 4 alerts exist', () => {
    const alerts = createMockAlerts(6);
    render(
      <AlertsSection
        alerts={alerts}
        dismissedAlertIds={[]}
        onDismiss={jest.fn()}
      />
    );

    // Should show "+2 more" button
    expect(screen.getByText('+2 more alerts')).toBeInTheDocument();
  });

  it('should show all alerts when "+N more" button is clicked', () => {
    const alerts = createMockAlerts(6);
    render(
      <AlertsSection
        alerts={alerts}
        dismissedAlertIds={[]}
        onDismiss={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTestId('show-more-alerts'));

    // Should now show "Show less" button
    expect(screen.getByText('Show less')).toBeInTheDocument();
    // Should show "Alerts (6)" in header (all alerts visible)
    expect(screen.getByText('Alerts (6)')).toBeInTheDocument();
  });

  it('should collapse back to 4 alerts when "Show less" clicked', () => {
    const alerts = createMockAlerts(6);
    render(
      <AlertsSection
        alerts={alerts}
        dismissedAlertIds={[]}
        onDismiss={jest.fn()}
      />
    );

    // Expand first
    fireEvent.click(screen.getByTestId('show-more-alerts'));
    // Then collapse
    fireEvent.click(screen.getByTestId('show-less-alerts'));

    // Should show "+2 more" button again
    expect(screen.getByText('+2 more alerts')).toBeInTheDocument();
  });

  // AC6: Pulse effect on recently updated alerts
  it('should pass recently updated status to alert cards', () => {
    const alerts = createMockAlerts(3);
    render(
      <AlertsSection
        alerts={alerts}
        dismissedAlertIds={[]}
        onDismiss={jest.fn()}
        recentlyUpdatedAlertIds={['alert-0']}
      />
    );

    // Check that the first alert has the pulse animation
    const alertCards = screen.getAllByTestId('alert-card');
    expect(alertCards[0]).toHaveClass('animate-pulse');
  });

  // AC5: Per-alert daily dismissal
  it('should pass dismissForToday handler to alert cards', () => {
    const alerts = createMockAlerts(2);
    const mockDismiss = jest.fn();
    const mockDismissForToday = jest.fn();
    render(
      <AlertsSection
        alerts={alerts}
        dismissedAlertIds={[]}
        onDismiss={mockDismiss}
        onDismissForToday={mockDismissForToday}
      />
    );

    // Should render dismiss options for each alert
    const dismissButtons = screen.getAllByLabelText('Dismiss alert options');
    expect(dismissButtons).toHaveLength(2);
  });
});

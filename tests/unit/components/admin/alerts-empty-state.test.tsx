/**
 * Unit Tests: Alerts Empty State Component
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 */

import { render, screen } from '@testing-library/react';
import { AlertsEmptyState } from '@/components/admin/alerts-empty-state';

describe('AlertsEmptyState', () => {
  it('should render empty state with correct message', () => {
    render(<AlertsEmptyState />);

    expect(screen.getByText('All caught up!')).toBeInTheDocument();
    expect(screen.getByText('No items requiring attention.')).toBeInTheDocument();
  });

  it('should have correct test id', () => {
    render(<AlertsEmptyState />);

    expect(screen.getByTestId('alerts-empty-state')).toBeInTheDocument();
  });

  it('should have green styling', () => {
    const { container } = render(<AlertsEmptyState />);

    const emptyState = screen.getByTestId('alerts-empty-state');
    expect(emptyState).toHaveClass('bg-green-50');
    expect(emptyState).toHaveClass('border-green-200');
  });

  it('should render checkmark icon', () => {
    render(<AlertsEmptyState />);

    // Check for the checkmark icon (lucide-react CheckCircle)
    const svg = screen.getByTestId('alerts-empty-state').querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

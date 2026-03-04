/**
 * Unit Tests: Alert Card Component
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { AlertCard } from '@/components/admin/alert-card';

describe('AlertCard', () => {
  const defaultProps = {
    type: 'low-inventory' as const,
    count: 3,
    priority: 'high' as const,
    items: [
      { id: '1', title: 'Product A', meta: 'Quantity: 0' },
      { id: '2', title: 'Product B', meta: 'Quantity: 2' },
      { id: '3', title: 'Product C', meta: 'Quantity: 4' },
    ],
    onDismiss: jest.fn(),
    actionLink: '/admin/inventory',
    actionLabel: 'Manage Inventory',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with correct title and count', () => {
    render(<AlertCard {...defaultProps} />);

    expect(screen.getByText('Low Inventory')).toBeInTheDocument();
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('should render HIGH priority with red styling', () => {
    const { container } = render(<AlertCard {...defaultProps} />);

    const alertCard = screen.getByTestId('alert-card');
    expect(alertCard).toHaveClass('border-red-500');
    expect(alertCard).toHaveClass('bg-red-50');
  });

  it('should render MEDIUM priority with yellow styling', () => {
    render(<AlertCard {...defaultProps} priority="medium" />);

    const alertCard = screen.getByTestId('alert-card');
    expect(alertCard).toHaveClass('border-yellow-500');
    expect(alertCard).toHaveClass('bg-yellow-50');
  });

  it('should render items list with correct content', () => {
    render(<AlertCard {...defaultProps} />);

    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 0')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.getByText('Product C')).toBeInTheDocument();
  });

  it('should show "+N more" when more than 3 items', () => {
    const manyItems = [
      ...defaultProps.items,
      { id: '4', title: 'Product D', meta: 'Quantity: 1' },
      { id: '5', title: 'Product E', meta: 'Quantity: 3' },
    ];

    render(<AlertCard {...defaultProps} items={manyItems} />);

    expect(screen.getByText('+2 more...')).toBeInTheDocument();
  });

  it('should call onDismiss when dismiss button clicked', () => {
    render(<AlertCard {...defaultProps} />);

    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.click(dismissButton);

    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should render action link with correct text', () => {
    render(<AlertCard {...defaultProps} />);

    expect(screen.getByText('Manage Inventory')).toBeInTheDocument();
  });

  it('should use custom title when provided', () => {
    render(<AlertCard {...defaultProps} title="Custom Alert Title" />);

    expect(screen.getByText('Custom Alert Title')).toBeInTheDocument();
    expect(screen.queryByText('Low Inventory')).not.toBeInTheDocument();
  });

  it('should have correct data attributes', () => {
    render(<AlertCard {...defaultProps} />);

    const alertCard = screen.getByTestId('alert-card');
    expect(alertCard).toHaveAttribute('data-alert-type', 'low-inventory');
    expect(alertCard).toHaveAttribute('data-priority', 'high');
  });

  it('should render different alert types with correct titles', () => {
    const { rerender } = render(<AlertCard {...defaultProps} />);
    expect(screen.getByText('Low Inventory')).toBeInTheDocument();

    rerender(<AlertCard {...defaultProps} type="pending-returns" />);
    expect(screen.getByText('Pending Returns')).toBeInTheDocument();

    rerender(<AlertCard {...defaultProps} type="support-tickets" />);
    expect(screen.getByText('Support Tickets')).toBeInTheDocument();

    rerender(<AlertCard {...defaultProps} type="failed-payments" />);
    expect(screen.getByText('Failed Payments')).toBeInTheDocument();
  });

  // AC6: Pulse effect on recent update
  it('should show pulse effect when recently updated', () => {
    render(<AlertCard {...defaultProps} isRecentlyUpdated={true} />);

    const alertCard = screen.getByTestId('alert-card');
    expect(alertCard).toHaveClass('animate-pulse');
    expect(alertCard).toHaveClass('ring-4');
  });

  it('should not show pulse effect when not recently updated', () => {
    render(<AlertCard {...defaultProps} isRecentlyUpdated={false} />);

    const alertCard = screen.getByTestId('alert-card');
    expect(alertCard).not.toHaveClass('animate-pulse');
  });

  // AC5: Don't show today functionality
  it('should show dismiss options when onDismissForToday is provided', () => {
    const mockDismissForToday = jest.fn();
    render(
      <AlertCard
        {...defaultProps}
        onDismissForToday={mockDismissForToday}
      />
    );

    const optionsButton = screen.getByLabelText('Dismiss alert options');
    expect(optionsButton).toBeInTheDocument();

    fireEvent.click(optionsButton);

    expect(screen.getByText('Dismiss for now')).toBeInTheDocument();
    expect(screen.getByText("Don't show today")).toBeInTheDocument();
  });

  it('should call onDismissForToday when "Don\'t show today" clicked', () => {
    const mockDismissForToday = jest.fn();
    render(
      <AlertCard
        {...defaultProps}
        onDismissForToday={mockDismissForToday}
      />
    );

    fireEvent.click(screen.getByLabelText('Dismiss alert options'));
    fireEvent.click(screen.getByText("Don't show today"));

    expect(mockDismissForToday).toHaveBeenCalledTimes(1);
  });
});

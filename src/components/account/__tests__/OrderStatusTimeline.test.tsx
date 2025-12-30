import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderStatusTimeline from '../OrderStatusTimeline';

describe('OrderStatusTimeline', () => {
  const mockOrder = {
    status: 'shipped' as const,
    ordered_at: '2025-01-01T10:00:00Z',
    production_started_at: '2025-01-02T10:00:00Z',
    quality_checked_at: '2025-01-03T10:00:00Z',
    shipped_at: '2025-01-04T10:00:00Z',
    delivered_at: null,
  };

  it('renders all status steps', () => {
    render(<OrderStatusTimeline order={mockOrder} />);
    expect(screen.getByText('Order Received')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
    expect(screen.getByText('Quality Check')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('shows completed steps with green styling', () => {
    render(<OrderStatusTimeline order={mockOrder} />);
    const receivedElement = screen.getByText('Order Received');
    const shippedElement = screen.getByText('Shipped');

    expect(receivedElement.closest('[class*="text-green"]')).toBeInTheDocument();
    expect(shippedElement.closest('[class*="text-green"]')).toBeInTheDocument();
  });

  it('shows incomplete steps with gray styling', () => {
    render(<OrderStatusTimeline order={mockOrder} />);
    const deliveredElement = screen.getByText('Delivered');

    expect(deliveredElement.closest('[class*="text-gray"]')).toBeInTheDocument();
  });

  it('displays timestamps for completed steps', () => {
    render(<OrderStatusTimeline order={mockOrder} />);
    expect(screen.getByText(/Jan.*1.*2025/)).toBeInTheDocument();
    expect(screen.getByText(/Jan.*2.*2025/)).toBeInTheDocument();
    expect(screen.getByText(/Jan.*4.*2025/)).toBeInTheDocument();
  });

  it('handles pending order status', () => {
    const pendingOrder = {
      ...mockOrder,
      status: 'pending' as const,
      production_started_at: null,
      quality_checked_at: null,
      shipped_at: null,
      delivered_at: null,
    };

    render(<OrderStatusTimeline order={pendingOrder} />);

    expect(screen.getByText('Order Received').closest('[class*="text-green"]')).toBeInTheDocument();
    expect(screen.getByText('Production').closest('[class*="text-gray"]')).toBeInTheDocument();
    expect(screen.getByText('Quality Check').closest('[class*="text-gray"]')).toBeInTheDocument();
    expect(screen.getByText('Shipped').closest('[class*="text-gray"]')).toBeInTheDocument();
    expect(screen.getByText('Delivered').closest('[class*="text-gray"]')).toBeInTheDocument();
  });
});

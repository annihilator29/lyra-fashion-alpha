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
    estimated_delivery_date: '2025-01-07T10:00:00Z',
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
    // Order Received and Production are completed but not current
    const receivedElement = screen.getByText('Order Received');
    const productionElement = screen.getByText('Production');

    expect(receivedElement.closest('[class*="text-green"]')).toBeInTheDocument();
    expect(productionElement.closest('[class*="text-green"]')).toBeInTheDocument();
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

    // Order Received is both completed and current, so current (blue) takes precedence
    expect(screen.getByText('Order Received').closest('[class*="text-blue"]')).toBeInTheDocument();
    expect(screen.getByText('Production').closest('[class*="text-gray"]')).toBeInTheDocument();
    expect(screen.getByText('Quality Check').closest('[class*="text-gray"]')).toBeInTheDocument();
    expect(screen.getByText('Shipped').closest('[class*="text-gray"]')).toBeInTheDocument();
    expect(screen.getByText('Delivered').closest('[class*="text-gray"]')).toBeInTheDocument();
  });

  it('displays estimated delivery date when available and not delivered', () => {
    render(<OrderStatusTimeline order={mockOrder} />);
    expect(screen.getByText('Estimated Delivery')).toBeInTheDocument();
    expect(screen.getByText(/Tuesday, January 7, 2025/)).toBeInTheDocument();
  });

  it('does not display estimated delivery date when order is delivered', () => {
    const deliveredOrder = {
      ...mockOrder,
      status: 'delivered' as const,
      delivered_at: '2025-01-06T10:00:00Z',
    };

    render(<OrderStatusTimeline order={deliveredOrder} />);
    expect(screen.queryByText('Estimated Delivery')).not.toBeInTheDocument();
  });

  it('does not display estimated delivery date when not set', () => {
    const noEstimateOrder = {
      ...mockOrder,
      estimated_delivery_date: null,
    };

    render(<OrderStatusTimeline order={noEstimateOrder} />);
    expect(screen.queryByText('Estimated Delivery')).not.toBeInTheDocument();
  });

  it('highlights current status with blue styling', () => {
    render(<OrderStatusTimeline order={mockOrder} />);
    const shippedElement = screen.getByText('Shipped');
    expect(screen.getByText('(Current)')).toBeInTheDocument();
    expect(shippedElement.closest('[class*="text-blue"]')).toBeInTheDocument();
  });

  it('shows current status for pending orders', () => {
    const pendingOrder = {
      ...mockOrder,
      status: 'pending' as const,
      production_started_at: null,
      quality_checked_at: null,
      shipped_at: null,
    };

    render(<OrderStatusTimeline order={pendingOrder} />);
    expect(screen.getByText('(Current)')).toBeInTheDocument();
  });

  it('shows current status for production orders', () => {
    const productionOrder = {
      ...mockOrder,
      status: 'production' as const,
      quality_checked_at: null,
      shipped_at: null,
    };

    render(<OrderStatusTimeline order={productionOrder} />);
    expect(screen.getByText('(Current)')).toBeInTheDocument();
  });
});

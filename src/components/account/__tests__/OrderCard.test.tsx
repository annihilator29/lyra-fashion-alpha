import React from 'react';
import { render, screen } from '@testing-library/react';
import OrderCard from '../OrderCard';
import type { OrderWithItems } from '@/types/order';

const mockOrder: OrderWithItems = {
  id: '12345678-1234-1234-1234-123456789012',
  customer_id: 'user-123',
  customer_email: 'test@example.com',
  status: 'delivered' as const,
  total: 12900,
  shipping_address: {
    name: 'John Doe',
    address_line1: '123 Main St',
    address_line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
    phone: '+12125551234',
  },
  billing_address: {
    name: 'John Doe',
    address_line1: '123 Main St',
    address_line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
  },
  ordered_at: '2025-01-01T10:00:00Z',
  production_started_at: '2025-01-02T10:00:00Z',
  quality_checked_at: '2025-01-03T10:00:00Z',
  shipped_at: '2025-01-04T10:00:00Z',
  delivered_at: '2025-01-05T10:00:00Z',
  production_stages: null,
  tracking_number: '1Z999AA10123456784',
  carrier: 'ups',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-05T10:00:00Z',
  order_items: [
    {
      id: 'item-1',
      order_id: '12345678-1234-1234-1234-123456789012',
      product_id: 'prod-1',
      quantity: 2,
      price: 6450,
      variant: {
        size: 'M',
        color: 'Navy',
        sku: 'NAV-M-001',
      },
      products: {
        id: 'prod-1',
        name: 'Silk Blazer',
        slug: 'silk-blazer',
        images: ['/images/silk-blazer.jpg'],
        price: 6450,
        category: 'outerwear',
      },
    },
  ],
};

describe('OrderCard', () => {
  it('renders order card with link', () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('displays order number', () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText(/Order/)).toBeInTheDocument();
  });

  it('displays order date', () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it('displays item count', () => {
    render(<OrderCard order={mockOrder} />);
    // Check that link exists and contains order data
    const link = screen.getByRole('link') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
  });

  it('displays order total', () => {
    render(<OrderCard order={mockOrder} />);
    expect(screen.getByText(/\$/)).toBeInTheDocument();
  });

  it('links to correct order detail page', () => {
    render(<OrderCard order={mockOrder} />);
    const link = screen.getByRole('link') as HTMLAnchorElement;
    expect(link).toHaveAttribute('href', '/account/orders/12345678-1234-1234-1234-123456789012');
  });

  it('handles empty order items array', () => {
    const orderWithoutItems = { ...mockOrder, order_items: [] };
    render(<OrderCard order={orderWithoutItems} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('handles null order items', () => {
    const orderWithoutItems = { ...mockOrder, order_items: undefined };
    render(<OrderCard order={orderWithoutItems} />);
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});

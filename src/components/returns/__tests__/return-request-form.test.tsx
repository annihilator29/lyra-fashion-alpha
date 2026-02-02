/**
 * Return Request Form Tests
 * Story 6.4: Returns & Refunds Processing - Task 9.2
 * 
 * Integration tests for return request flow using React Testing Library
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReturnRequestForm } from '../return-request-form';
import type { OrderWithItems } from '@/types/order';

// Mock the mutations module
jest.mock('@/lib/returns/mutations', () => ({
  createReturnRequest: jest.fn(),
}));

// Mock the queries module
jest.mock('@/lib/returns/queries', () => ({
  checkItemsAlreadyReturned: jest.fn(() => Promise.resolve({ alreadyReturned: [] })),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/navigation useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const mockOrder: OrderWithItems = {
  id: 'order-123',
  order_number: 'ORD-2025-001',
  status: 'delivered',
  customer_id: 'user-123',
  customer_email: 'test@example.com',
  total: 200,
  billing_address: null,
  ordered_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  production_started_at: null,
  quality_checked_at: null,
  shipped_at: null,
  delivered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  production_stages: null,
  production_completion_estimate: null,
  qc_photo_url: null,
  tracking_number: null,
  carrier: null,
  estimated_delivery_date: null,
  created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  shipping_address: {
    name: 'Test User',
    address_line1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'US',
  },
  order_items: [
    {
      id: 'item-1',
      order_id: 'order-123',
      product_id: 'prod-1',
      quantity: 1,
      price: 50,
      variant: { size: 'M', color: 'Blue' },
      products: {
        id: 'prod-1',
        name: 'Test Product 1',
        slug: 'test-product-1',
        category: 'clothing',
        price: 50,
        images: ['https://example.com/image1.jpg'],
        final_sale: false,
      },
    },
    {
      id: 'item-2',
      order_id: 'order-123',
      product_id: 'prod-2',
      quantity: 2,
      price: 75,
      variant: { size: 'L', color: 'Red' },
      products: {
        id: 'prod-2',
        name: 'Test Product 2',
        slug: 'test-product-2',
        category: 'clothing',
        price: 75,
        images: ['https://example.com/image2.jpg'],
        final_sale: false,
      },
    },
  ],
};

describe('ReturnRequestForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with order items', () => {
    render(<ReturnRequestForm order={mockOrder} />);

    expect(screen.getByText('Select Items to Return')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('Return Reason')).toBeInTheDocument();
  });

  it('displays item details correctly', () => {
    render(<ReturnRequestForm order={mockOrder} />);

    expect(screen.getByText('Size: M | Color: Blue')).toBeInTheDocument();
    expect(screen.getByText('Size: L | Color: Red')).toBeInTheDocument();
    expect(screen.getByText('Qty: 1 × $50.00')).toBeInTheDocument();
    expect(screen.getByText('Qty: 2 × $75.00')).toBeInTheDocument();
  });

  it('allows selecting items to return', async () => {
    const user = userEvent.setup();
    render(<ReturnRequestForm order={mockOrder} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);

    await user.click(checkboxes[0]);
    expect(checkboxes[0]).toBeChecked();
  });

  it('shows refund summary when items are selected', async () => {
    const user = userEvent.setup();
    
    render(<ReturnRequestForm order={mockOrder} />);

    // Initially, no refund summary
    expect(screen.queryByText('Refund Summary')).not.toBeInTheDocument();

    // Select an item
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Refund summary should appear
    expect(screen.getByText('Refund Summary')).toBeInTheDocument();
    expect(screen.getByText('Items selected:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('calculates correct refund for multiple items', async () => {
    const user = userEvent.setup();
    render(<ReturnRequestForm order={mockOrder} />);

    const checkboxes = screen.getAllByRole('checkbox');
    
    // Select both items
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    // Should show total for both items (50 + 75*2 = 200)
    expect(screen.getByText('Items selected:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  it('has all return reason options', () => {
    render(<ReturnRequestForm order={mockOrder} />);

    // Open the select dropdown
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toBeInTheDocument();
  });

  it('has condition notes textarea', () => {
    render(<ReturnRequestForm order={mockOrder} />);

    const textarea = screen.getByPlaceholderText(/Describe the condition of the items/i);
    expect(textarea).toBeInTheDocument();
  });

  it('disables submit button when no items selected', () => {
    render(<ReturnRequestForm order={mockOrder} />);

    const submitButton = screen.getByRole('button', { name: /Submit Return Request/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when items are selected', async () => {
    const user = userEvent.setup();
    render(<ReturnRequestForm order={mockOrder} />);

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    const submitButton = screen.getByRole('button', { name: /Submit Return Request/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    const { createReturnRequest } = await import('@/lib/returns/mutations');
    (createReturnRequest as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => setTimeout(() => resolve({ success: true, return: { rma_number: 'RMA-123' } }), 100))
    );

    render(<ReturnRequestForm order={mockOrder} />);

    // Select an item
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Click submit
    const submitButton = screen.getByRole('button', { name: /Submit Return Request/i });
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText(/Submitting.../i)).toBeInTheDocument();
  });

  it('excludes final sale items from returnable items', () => {
    const orderWithFinalSale = {
      ...mockOrder,
      order_items: [
        ...(mockOrder.order_items || []),
        {
          id: 'item-3',
          order_id: 'order-123',
          product_id: 'prod-3',
          quantity: 1,
          price: 100,
          variant: null,
          products: {
            id: 'prod-3',
            name: 'Final Sale Item',
            slug: 'final-sale-item',
            category: 'accessories',
            price: 100,
            images: [],
            final_sale: true,
          },
        },
      ],
    };

    render(<ReturnRequestForm order={orderWithFinalSale} />);

    // Should only show 2 checkboxes (non-final-sale items)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(screen.queryByText('Final Sale Item')).not.toBeInTheDocument();
  });

  it('shows empty state when no returnable items', () => {
    const orderWithNoReturnableItems = {
      ...mockOrder,
      order_items: mockOrder.order_items?.map(item => ({
        ...item,
        products: item.products ? { ...item.products, final_sale: true } : undefined,
      })) || [],
    };

    render(<ReturnRequestForm order={orderWithNoReturnableItems} />);

    expect(screen.getByText(/No returnable items found in this order/i)).toBeInTheDocument();
  });
});

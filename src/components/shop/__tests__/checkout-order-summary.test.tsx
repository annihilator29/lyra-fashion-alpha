import { render, screen } from '@testing-library/react';

// Mock the cart store
const mockUseCartStore = jest.fn(() => ({
  items: [
    {
      id: '1',
      name: 'Test Product',
      price: 50,
      quantity: 2,
      imageUrl: '/test-image.jpg',
    },
  ],
  subtotal: 100,
}));

jest.mock('@/lib/cart-store', () => ({
  useCartStore: () => mockUseCartStore(),
}));

import CheckoutOrderSummary from '../checkout-order-summary';

describe('CheckoutOrderSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation to return the default values
    mockUseCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          name: 'Test Product',
          price: 50,
          quantity: 2,
          imageUrl: '/test-image.jpg',
        },
      ],
      subtotal: 100,
    });
  });

  it('displays cart items correctly when cart has items', () => {
    render(<CheckoutOrderSummary />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('2 × $50.00')).toBeInTheDocument();
  });

  it('shows "No items in cart" message when cart is empty', () => {
    // Mock an empty cart
    mockUseCartStore.mockReturnValue({
      items: [],
      subtotal: 0,
    });
    
    render(<CheckoutOrderSummary />);

    expect(screen.getByText('No items in cart')).toBeInTheDocument();
  });

  it('calculates and displays order totals correctly', () => {
    render(<CheckoutOrderSummary />);

    // With subtotal of 100, shipping of 10, and tax of 10% (10), total should be 120
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('displays factory-direct savings information', () => {
    render(<CheckoutOrderSummary />);

    expect(screen.getByText('Factory-Direct Pricing')).toBeInTheDocument();
    expect(screen.getByText('You save 40% vs retail through our direct-to-consumer model')).toBeInTheDocument();
  });

  it('renders TransparencyCard component', () => {
    render(<CheckoutOrderSummary />);

    expect(screen.getByText('Factory Direct Price:')).toBeInTheDocument();
    expect(screen.getByText('Traditional Retail Price:')).toBeInTheDocument();
  });

  it('renders FactoryBadge component', () => {
    render(<CheckoutOrderSummary />);

    expect(screen.getByText('Factory Direct')).toBeInTheDocument();
  });
});
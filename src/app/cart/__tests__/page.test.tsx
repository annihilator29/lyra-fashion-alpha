
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartPage from '../page';

// Mock the cart store
jest.mock('@/lib/cart-store', () => ({
  useCartStore: jest.fn(),
}));

// Mock Next.js Link and Image
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>;
    };
});

jest.mock('next/image', () => {
    return ({ src, alt }: { src: string; alt: string }) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} />;
    };
});

describe('CartPage', () => {
  const mockUpdateQuantity = jest.fn();
  const mockRemoveItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when cart is empty', () => {
    const { useCartStore } = require('@/lib/cart-store');
    useCartStore.mockReturnValue({
      items: [],
      subtotal: 0,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartPage />);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Start Shopping')).toBeInTheDocument();
  });

  it('renders cart items and summary', () => {
    const { useCartStore } = require('@/lib/cart-store');
    useCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          name: 'Test Product',
          price: 10000,
          quantity: 2,
          imageUrl: '/test.jpg',
          variant: { size: 'M', color: 'Red' },
          slug: 'test-product',
        },
      ],
      subtotal: 20000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartPage />);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    const prices = screen.getAllByText('$200.00');
    expect(prices).toHaveLength(3); // Item total, Subtotal, Grand Total
    expect(screen.getByText('M / Red')).toBeInTheDocument();
    
    // Summary
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('calls updateQuantity when quantity buttons are clicked', () => {
     const { useCartStore } = require('@/lib/cart-store');
    useCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          name: 'Test Product',
          price: 10000,
          quantity: 2,
          imageUrl: '/test.jpg',
          variant: { size: 'M', color: 'Red' },
          slug: 'test-product',
        },
      ],
      subtotal: 20000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartPage />);

    const increaseButton = screen.getByRole('button', { name: /increase quantity/i });
    fireEvent.click(increaseButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3);

    const decreaseButton = screen.getByRole('button', { name: /decrease quantity/i });
    fireEvent.click(decreaseButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 1);
  });

  it('calls removeItem when trash button is clicked', () => {
     const { useCartStore } = require('@/lib/cart-store');
    useCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          name: 'Test Product',
          price: 100,
          quantity: 1,
          imageUrl: '/test.jpg',
          variant: { size: 'M', color: 'Red' },
          slug: 'test-product',
        },
      ],
      subtotal: 100,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartPage />);

    // Depending on screen size logic in component, text might be hidden but icon is there.
    // We can find by the trash icon's parent button usually, or just role/text if accessible.
    // The component has "Remove" text in a span that might be visually hidden on small screens but present in DOM
    const removeButton = screen.getByText('Remove').closest('button');
    if (removeButton) {
        fireEvent.click(removeButton);
        expect(mockRemoveItem).toHaveBeenCalledWith('1');
    } else {
        // Fallback if text search fails (e.g. if implementation changes)
        // But in our case we know the text is "Remove"
         throw new Error('Remove button not found');
    }
  });
});

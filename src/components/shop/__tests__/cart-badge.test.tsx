import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CartBadge } from '../cart-badge';
import { useCartStore } from '@/lib/cart-store';
import type { CartItem } from '@/types/cart';

// Mock the cart store
jest.mock('@/lib/cart-store');

const mockCartItem: CartItem = {
  id: 'prod-123-m-blue',
  productId: 'prod-123',
  slug: 'cotton-dress',
  category: 'dresses',
  name: 'Cotton Dress',
  price: 12000,
  imageUrl: '/dress.jpg',
  variant: { size: 'M', color: 'Blue' },
  quantity: 1,
  inStock: true,
};

describe('CartBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStore = (overrides = {}) => {
    const state = {
      items: [],
      totalItems: 0,
      subtotal: 0,
      updatedAt: 0,
      isOpen: false,
      setIsOpen: jest.fn(),
      addItem: jest.fn(),
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      ...overrides,
    };
    (useCartStore as jest.MockedFunction<typeof useCartStore>).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (selector) => (selector ? selector(state) : state) as any
    );
  };

  it('should display cart icon', () => {
    mockStore();
    render(<CartBadge />);
    expect(screen.getByRole('button', { name: /shopping cart/i })).toBeInTheDocument();
  });

  it('should not display badge when cart is empty', () => {
    mockStore({ totalItems: 0 });
    render(<CartBadge />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should display badge with item count when cart has items', () => {
    mockStore({
      totalItems: 3,
      items: [{ ...mockCartItem, quantity: 3 }],
    });
    render(<CartBadge />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display 99+ when cart has more than 99 items', () => {
    mockStore({
      totalItems: 150,
      items: [{ ...mockCartItem, quantity: 150 }],
    });
    render(<CartBadge />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    mockStore({ totalItems: 3 });
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<CartBadge onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label with item count', () => {
    mockStore({ totalItems: 5 });
    render(<CartBadge />);
    expect(screen.getByRole('button', { name: 'Shopping cart with 5 items' })).toBeInTheDocument();
  });
});
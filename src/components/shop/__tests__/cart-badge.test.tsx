import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CartBadge } from '../cart-badge';
import { useCartStore } from '@/lib/cart-store';

// Mock the cart store
jest.mock('@/lib/cart-store');

describe('CartBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display cart icon', () => {
    (useCartStore as any).mockReturnValue(0);

    render(<CartBadge />);

    const button = screen.getByRole('button', {
      name: /shopping cart/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('should not display badge when cart is empty', () => {
    (useCartStore as any).mockReturnValue(0);

    render(<CartBadge />);

    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });

  it('should display badge with item count when cart has items', () => {
    (useCartStore as any).mockReturnValue(3);

    render(<CartBadge />);

    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
  });

  it('should display 99+ when cart has more than 99 items', () => {
    (useCartStore as any).mockReturnValue(150);

    render(<CartBadge />);

    const badge = screen.getByText('99+');
    expect(badge).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    (useCartStore as any).mockReturnValue(3);
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<CartBadge onClick={handleClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct aria-label with item count', () => {
    (useCartStore as any).mockReturnValue(5);

    render(<CartBadge />);

    const button = screen.getByRole('button', {
      name: 'Shopping cart with 5 items',
    });
    expect(button).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { CartSlideOver } from '../cart-slide-over';
import { useCartStore } from '@/lib/cart-store';

jest.mock('@/lib/cart-store');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        in: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}));

const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>;

describe('Cart Mobile UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply mobile-specific classes when window is narrow', () => {
    // Set window innerWidth to mobile
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    mockUseCartStore.mockReturnValue({
      items: [{ id: '1', name: 'Test', price: 100, quantity: 1, variant: { size: 'M', color: 'Red' }, imageUrl: '', productId: 'p1', slug: 's1', inStock: true }],
      subtotal: 100,
      isOpen: true,
      setIsOpen: jest.fn(),
      updateQuantity: jest.fn(),
      removeItem: jest.fn(),
      updatedAt: Date.now(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<CartSlideOver />);
    
    // Check for Proceed to Checkout button which is in the sticky footer
    const checkoutButton = screen.getByRole('link', { name: /proceed to checkout/i });
    expect(checkoutButton.closest('div.fixed.bottom-0')).toBeInTheDocument();
  });

  it('should use full-screen logic for mobile view', () => {
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    mockUseCartStore.mockReturnValue({
      items: [],
      subtotal: 0,
      isOpen: true,
      setIsOpen: jest.fn(),
      updatedAt: Date.now(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<CartSlideOver />);
    
    // The DialogContent should have full-screen classes
    const dialogContent = screen.getByRole('dialog');
    expect(dialogContent).toHaveClass('h-full', 'w-full', 'max-w-full');
  });
});

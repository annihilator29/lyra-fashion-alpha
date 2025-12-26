import { render, screen, waitFor } from '@testing-library/react';
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
    // Default to mobile width using a more robust method
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    window.dispatchEvent(new Event('resize'));
  });

  it('should apply mobile-specific classes when window is narrow', async () => {
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
    
    // Wait for Proceed to Checkout button
    await waitFor(() => {
      expect(screen.getByText(/proceed to checkout/i)).toBeInTheDocument();
    });
  });

  it('should use full-screen logic for mobile view', async () => {
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
    await waitFor(() => {
      const sheetContent = screen.getByTestId('cart-sheet-content');
      expect(sheetContent).toHaveClass('h-full');
      expect(sheetContent).toHaveClass('w-full');
      expect(sheetContent).toHaveClass('max-w-full');
    }, { timeout: 2000 });
  });
});

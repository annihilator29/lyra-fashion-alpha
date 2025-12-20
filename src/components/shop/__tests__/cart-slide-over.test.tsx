import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CartSlideOver } from '../cart-slide-over';
import { useCartStore } from '@/lib/cart-store';
import type { CartItem } from '@/types/cart';

// Mock dependencies
jest.mock('@/lib/cart-store');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

const mockUseCartStore = useCartStore as jest.MockedFunction<
  typeof useCartStore
>;

const mockCartItem: CartItem = {
  id: 'prod-123-medium-blue',
  productId: 'prod-123',
  slug: 'organic-cotton-dress',
  name: 'Organic Cotton Dress',
  price: 12000,
  imageUrl: '/images/dress.jpg',
  variant: { size: 'Medium', color: 'Blue' },
  quantity: 2,
  inStock: true,
};

describe('CartSlideOver', () => {
  const mockUpdateQuantity = jest.fn();
  const mockRemoveItem = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth for mobile/desktop detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('should display empty cart message when cart is empty', () => {
    mockUseCartStore.mockReturnValue({
      items: [],
      subtotal: 0,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue shopping/i })
    ).toBeInTheDocument();
  });

  it('should display cart items when cart has items', () => {
    mockUseCartStore.mockReturnValue({
      items: [mockCartItem],
      subtotal: 24000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText('Organic Cotton Dress')).toBeInTheDocument();
    expect(screen.getByText('Medium / Blue')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display correct subtotal', () => {
    mockUseCartStore.mockReturnValue({
      items: [mockCartItem],
      subtotal: 24000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('$240.00')).toBeInTheDocument();
  });

  it('should increment quantity when plus button clicked', async () => {
    const user = userEvent.setup();
    mockUseCartStore.mockReturnValue({
      items: [mockCartItem],
      subtotal: 24000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    const increaseButton = screen.getByRole('button', {
      name: /increase quantity/i,
    });
    await user.click(increaseButton);

    expect(mockUpdateQuantity).toHaveBeenCalledWith(
      'prod-123-medium-blue',
      3
    );
  });

  it('should decrement quantity when minus button clicked', async () => {
    const user = userEvent.setup();
    mockUseCartStore.mockReturnValue({
      items: [mockCartItem],
      subtotal: 24000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    const decreaseButton = screen.getByRole('button', {
      name: /decrease quantity/i,
    });
    await user.click(decreaseButton);

    expect(mockUpdateQuantity).toHaveBeenCalledWith(
      'prod-123-medium-blue',
      1
    );
  });

  it('should remove item when quantity decreased to 0', async () => {
    const user = userEvent.setup();
    const itemWithQuantityOne = { ...mockCartItem, quantity: 1 };

    mockUseCartStore.mockReturnValue({
      items: [itemWithQuantityOne],
      subtotal: 12000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    const decreaseButton = screen.getByRole('button', {
      name: /decrease quantity/i,
    });
    await user.click(decreaseButton);

    expect(mockRemoveItem).toHaveBeenCalledWith('prod-123-medium-blue');
  });

  it('should remove item when remove button clicked', async () => {
    const user = userEvent.setup();
    mockUseCartStore.mockReturnValue({
      items: [mockCartItem],
      subtotal: 24000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledWith('prod-123-medium-blue');
  });

  it('should close cart when continue shopping clicked', async () => {
    const user = userEvent.setup();
    mockUseCartStore.mockReturnValue({
      items: [mockCartItem],
      subtotal: 24000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    const continueButton = screen.getByRole('button', {
      name: /continue shopping/i,
    });
    await user.click(continueButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should display checkout link', () => {
    mockUseCartStore.mockReturnValue({
      items: [mockCartItem],
      subtotal: 24000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    const checkoutLink = screen.getByRole('link', {
      name: /proceed to checkout/i,
    });
    expect(checkoutLink).toHaveAttribute('href', '/checkout');
  });

  it('should display cart item count in title', () => {
    mockUseCartStore.mockReturnValue({
      items: [mockCartItem, { ...mockCartItem, id: 'different-id' }],
      subtotal: 48000,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    });

    render(<CartSlideOver open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText(/your cart \(2\)/i)).toBeInTheDocument();
  });
});

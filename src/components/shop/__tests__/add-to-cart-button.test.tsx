import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { AddToCartButton } from '../add-to-cart-button';
import { useCartStore } from '@/lib/cart-store';
import { checkStock } from '@/lib/supabase/inventory';
import { toast } from 'sonner';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

// Mock dependencies
jest.mock('@/lib/cart-store');
jest.mock('@/lib/supabase/inventory');
jest.mock('sonner');

const mockProduct: Product = {
  id: 'prod-123',
  name: 'Organic Cotton Dress',
  slug: 'organic-cotton-dress',
  description: 'Beautiful dress',
  price: 12000,
  images: ['/images/dress.jpg'],
  category: 'dresses',
  craftsmanship_content: null,
  transparency_data: null,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
};

describe('AddToCartButton', () => {
  const mockAddItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Zustand store selector with proper typing
    (useCartStore as jest.MockedFunction<typeof useCartStore>).mockImplementation((selector) => {
      const storeState = {
        items: [],
        totalItems: 0,
        subtotal: 0,
        isOpen: false,
        setIsOpen: jest.fn(),
        addItem: mockAddItem,
        updateQuantity: jest.fn(),
        removeItem: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      return selector ? selector(storeState) : storeState;
    });
    (toast as jest.MockedFunction<typeof toast>).error = jest.fn();
    (toast as jest.MockedFunction<typeof toast>).success = jest.fn();
    (checkStock as jest.MockedFunction<typeof checkStock>).mockResolvedValue({ inStock: true, quantity: 10 });
  });

  it('should be disabled when no size selected', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedSize={null}
        selectedColor="Blue"
      />
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    expect(button).toBeDisabled();
  });

  it('should be disabled when no color selected', () => {
    render(
      <AddToCartButton
        product={mockProduct}
        selectedSize="Medium"
        selectedColor={null}
      />
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    expect(button).toBeDisabled();
  });

  it('should check stock before adding to cart', async () => {
    const user = userEvent.setup();

    render(
      <AddToCartButton
        product={mockProduct}
        selectedSize="Medium"
        selectedColor="Blue"
      />
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);

    await waitFor(() => {
      expect(checkStock).toHaveBeenCalledWith('prod-123', 'Medium', 'Blue');
    });
  });

  it('should show error toast when product is out of stock', async () => {
    const user = userEvent.setup();
    (checkStock as jest.MockedFunction<typeof checkStock>).mockResolvedValue({ inStock: false, quantity: 0 });

    render(
      <AddToCartButton
        product={mockProduct}
        selectedSize="Medium"
        selectedColor="Blue"
      />
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);

    await waitFor(() => {
      expect((toast as jest.MockedFunction<typeof toast>).error).toHaveBeenCalledWith(
        'This item is currently out of stock'
      );
    });

    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('should add item to cart when in stock', async () => {
    const user = userEvent.setup();

    render(
      <AddToCartButton
        product={mockProduct}
        selectedSize="Medium"
        selectedColor="Blue"
      />
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(
        mockProduct,
        {
          size: 'Medium',
          color: 'Blue',
        },
        undefined
      );
    });
  });

  it('should show success toast after adding to cart', async () => {
    const user = userEvent.setup();

    render(
      <AddToCartButton
        product={mockProduct}
        selectedSize="Medium"
        selectedColor="Blue"
      />
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    await user.click(button);

    await waitFor(() => {
      expect((toast as jest.MockedFunction<typeof toast>).success).toHaveBeenCalledWith(
        'Added to cart',
        expect.objectContaining({
          description: 'Organic Cotton Dress - Medium, Blue',
        })
      );
    });
  });
});

import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../cart-store';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

// Mock product for testing
const mockProduct: Product = {
  id: 'prod-123',
  name: 'Organic Cotton Dress',
  slug: 'organic-cotton-dress',
  description: 'Beautiful organic cotton dress',
  price: 12000, // $120.00 in cents
  images: ['/images/dress.jpg'],
  category: 'dresses',
  craftsmanship_content: null,
  transparency_data: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

describe('useCartStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
    // Clear localStorage
    localStorage.clear();
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCartStore());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should add item to cart with variant', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      productId: 'prod-123',
      name: 'Organic Cotton Dress',
      price: 12000,
      variant: { size: 'Medium', color: 'Blue' },
      quantity: 1,
    });
    expect(result.current.totalItems).toBe(1);
    expect(result.current.subtotal).toBe(12000);
  });

  it('should increment quantity when adding same item', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.subtotal).toBe(24000);
  });

  it('should add separate cart item for different variant', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
      result.current.addItem(mockProduct, { size: 'Large', color: 'Red' });
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.subtotal).toBe(24000);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
    });

    const itemId = result.current.items[0].id;

    act(() => {
      result.current.updateQuantity(itemId, 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.subtotal).toBe(36000);
  });

  it('should remove item when quantity updated to 0', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
    });

    const itemId = result.current.items[0].id;

    act(() => {
      result.current.updateQuantity(itemId, 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
      result.current.addItem(mockProduct, { size: 'Large', color: 'Red' });
    });

    const firstItemId = result.current.items[0].id;

    act(() => {
      result.current.removeItem(firstItemId);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.subtotal).toBe(12000);
  });

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
      result.current.addItem(mockProduct, { size: 'Large', color: 'Red' });
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should compute totalItems correctly with multiple items', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
      result.current.addItem(mockProduct, { size: 'Large', color: 'Red' });
    });

    expect(result.current.totalItems).toBe(3); // 2 + 1
  });

  it('should compute subtotal correctly with multiple items', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
      result.current.addItem(mockProduct, { size: 'Large', color: 'Red' });
    });

    expect(result.current.subtotal).toBe(36000); // $120 * 3
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem(mockProduct, { size: 'Medium', color: 'Blue' });
    });

    // Check localStorage
    const storedData = localStorage.getItem('cart-storage');
    expect(storedData).toBeTruthy();

    const parsed = JSON.parse(storedData!);
    expect(parsed.state.items).toHaveLength(1);
    expect(parsed.state.totalItems).toBe(1);
  });

  it('should restore cart from localStorage', () => {
    // First session: add items
    const { result: firstResult } = renderHook(() => useCartStore());

    act(() => {
      firstResult.current.addItem(mockProduct, {
        size: 'Medium',
        color: 'Blue',
      });
    });

    // Simulate new session: create new hook instance
    const { result: secondResult } = renderHook(() => useCartStore());

    // Cart should be restored
    expect(secondResult.current.items).toHaveLength(1);
    expect(secondResult.current.totalItems).toBe(1);
    expect(secondResult.current.subtotal).toBe(12000);
  });
});

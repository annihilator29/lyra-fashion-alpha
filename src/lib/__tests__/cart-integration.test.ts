import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../cart-store';

// Mock dependencies
jest.mock('../supabase/inventory');
jest.mock('../supabase/client');

const mockProduct = {
  id: 'prod-123',
  name: 'Organic Cotton Dress',
  slug: 'organic-cotton-dress',
  category: 'dresses',
  price: 12000,
  images: ['/images/dress.jpg'],
};

describe('Cart Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should handle full lifecycle: add -> update -> remove', async () => {
    const { result } = renderHook(() => useCartStore());

    // 1. Add item
    await act(async () => {
      result.current.addItem(mockProduct, { size: 'M', color: 'Blue' });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);

    // 2. Update quantity
    const itemId = result.current.items[0].id;
    act(() => {
      result.current.updateQuantity(itemId, 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);

    // 3. Remove item
    act(() => {
      result.current.removeItem(itemId);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('should persist and hydrate with updatedAt', async () => {
    const { result: firstResult } = renderHook(() => useCartStore());

    act(() => {
      firstResult.current.addItem(mockProduct, { size: 'M', color: 'Blue' });
    });

    const initialUpdatedAt = firstResult.current.updatedAt;
    expect(initialUpdatedAt).toBeDefined();

    // Fast forward time slightly
    jest.useFakeTimers();
    jest.advanceTimersByTime(1000);

    const { result: secondResult } = renderHook(() => useCartStore());
    expect(secondResult.current.items).toHaveLength(1);
    expect(secondResult.current.updatedAt).toBe(initialUpdatedAt);
    
    jest.useRealTimers();
  });
});

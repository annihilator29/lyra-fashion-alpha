import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartState, CartItem, MinimalProduct } from '@/types/cart';
import { generateCartItemId } from '@/types/cart';

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      isOpen: false,

      setIsOpen: (open: boolean) => set({ isOpen: open }),

      addItem: (product: MinimalProduct, variant: { size: string; color: string }, price?: number) => {
        const itemPrice = price ?? product.price;
        const cartItemId = generateCartItemId(
          product.id,
          variant.size,
          variant.color
        );

        set((state) => {
          // Check if item already exists
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === cartItemId
          );

          let newItems: CartItem[];

          if (existingItemIndex > -1) {
            // Item exists, increment quantity
            newItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            // New item, add to cart
            const newItem: CartItem = {
              id: cartItemId,
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: itemPrice,
              imageUrl: product.images[0] || '/images/placeholder.jpg',
              variant,
              quantity: 1,
              inStock: true, // Stock check should be done before calling addItem
            };
            newItems = [...state.items, newItem];
          }

          // Compute totals
          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const subtotal = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: newItems, totalItems, subtotal };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const newItems = state.items.filter((item) => item.id !== itemId);
            const totalItems = newItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            const subtotal = newItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            return { items: newItems, totalItems, subtotal };
          }

          // Update quantity
          const newItems = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );

          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const subtotal = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return { items: newItems, totalItems, subtotal };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          const totalItems = newItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          const subtotal = newItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          return { items: newItems, totalItems, subtotal };
        });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, subtotal: 0 });
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        subtotal: state.subtotal,
      }),
    }
  )
);

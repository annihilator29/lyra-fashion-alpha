import type { Database } from './database.types';

type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem {
  id: string; // Unique cart item ID (product_id + variant)
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  variant: {
    size: string;
    color: string;
  };
  quantity: number;
  inStock: boolean; // Real-time stock status
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, variant: { size: string; color: string }) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

/**
 * Generate unique cart item ID from product ID and variant
 * @param productId - Product UUID
 * @param size - Size variant
 * @param color - Color variant
 * @returns Unique cart item ID
 */
export function generateCartItemId(productId: string, size: string, color: string): string {
  return `${productId}-${size.toLowerCase().replace(/\s+/g, '-')}-${color
    .toLowerCase()
    .replace(/\s+/g, '-')}`;
}

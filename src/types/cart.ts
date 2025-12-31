export interface MinimalProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  images: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface CartItem {
  id: string; // Unique cart item ID (product_id + variant)
  productId: string;
  slug: string;
  category: string;
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
  updatedAt: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: MinimalProduct, variant: { size: string; color: string }, price?: number) => void;
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

/**
 * WishlistGrid Component
 * Story 4.4 - Wishlist & Favorites
 */

import { cn } from '@/lib/utils';
import type { Product } from '@/types/database.types';
import { WishlistCard } from './wishlist-card';

interface WishlistGridProps {
  products: Product[];
  isLoading?: boolean;
  onRemoved?: () => void; // Callback when an item is removed to refresh the page
  className?: string;
}

/**
 * WishlistGrid Component
 *
 * Displays wishlist products in a responsive grid layout.
 * Breakpoints: mobile (1 col), tablet (2 cols), desktop (4 cols)
 *
 * @example
 * ```tsx
 * <WishlistGrid products={products} onRemoved={refresh} />
 * ```
 */
export function WishlistGrid({ products, isLoading = false, onRemoved, className }: WishlistGridProps) {
  return (
    <div
      className={cn(
        // Responsive grid layout from task requirements
        'grid gap-4',
        // Mobile: <640px - 1 column
        'grid-cols-1',
        // Tablet: 640-1024px - 2 columns
        'sm:grid-cols-2',
        // Desktop: >1024px - 4 columns
        'lg:grid-cols-4',
        className
      )}
    >
      {isLoading ? (
        // Loading state - render skeleton cards
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 p-4 rounded-lg bg-card border"
          >
            <div className="aspect-[3/4] w-full animate-pulse bg-muted rounded-md" />
            <div className="space-y-1">
              <div className="h-4 w-1/3 animate-pulse bg-muted rounded-md" />
              <div className="h-6 w-3/4 animate-pulse bg-muted rounded-md" />
              <div className="mt-2 h-8 w-1/2 animate-pulse bg-muted rounded-md" />
            </div>
            <div className="mt-auto flex gap-2">
              <div className="h-10 flex-1 animate-pulse bg-muted rounded-md" />
              <div className="h-10 flex-1 animate-pulse bg-muted rounded-md" />
            </div>
          </div>
        ))
      ) : products.length === 0 ? (
        // Empty state handled by parent component
        null
      ) : (
        products.map((product) => (
          <WishlistCard
            key={product.id}
            product={product}
            isOutOfStock={false} // TODO: Check stock status when product variants are implemented
            onRemoved={onRemoved}
          />
        ))
      )}
    </div>
  );
}

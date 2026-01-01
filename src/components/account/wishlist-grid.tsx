/**
 * WishlistGrid Component
 * Story 4.4 - Wishlist & Favorites
 */

import { cn } from '@/lib/utils';
import type { Product } from '@/types/database.types';

interface WishlistGridProps {
  products: Product[];
  isLoading?: boolean;
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
 * <WishlistGrid products={products} />
 * ```
 */
export function WishlistGrid({ products, isLoading = false, className }: WishlistGridProps) {
  return (
    <div
      className={cn(
        // Responsive grid layout from task requirements
        'grid gap-6',
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
            className="flex flex-col gap-4 p-4 rounded-lg bg-card border"
          >
            <div className="aspect-[3/4] w-full animate-pulse bg-muted rounded-md" />
            <div className="h-6 w-3/4 animate-pulse bg-muted rounded-md" />
            <div className="h-4 w-1/2 animate-pulse bg-muted rounded-md" />
            <div className="mt-auto h-8 w-1/3 animate-pulse bg-muted rounded-md" />
          </div>
        ))
      ) : products.length === 0 ? (
        // Empty state handled by parent component
        null
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-4 p-4 rounded-lg bg-card border"
          >
            {/* Product Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
              {/* TODO: Add Image component when wishlist items are implemented */}
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                Product Image
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col gap-1">
              {/* Category */}
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {product.category}
              </span>

              {/* Name */}
              <h3 className="font-serif text-lg font-medium leading-tight text-foreground line-clamp-2">
                {product.name}
              </h3>

              {/* Price */}
              <p className="mt-auto pt-2 text-base font-semibold text-foreground">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

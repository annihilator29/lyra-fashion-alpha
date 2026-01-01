'use client';

import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Product } from '@/types/database.types';
import { isInGuestWishlist, addToGuestWishlist, removeFromGuestWishlist } from '@/lib/wishlist-utils';

interface WishlistItemProps {
  product: Product;
  onRemove?: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  isOutOfStock?: boolean;
  originalPrice?: number; // For price change detection
  className?: string;
}

/**
 * WishlistItem Component
 *
 * Displays a single wishlist item with favorite, remove, and add to cart actions.
 * Shows price change indicators and stock status.
 *
 * @example
 * ```tsx
 * <WishlistItem product={product} onRemove={handleRemove} />
 * ```
 */
export function WishlistItem({
  product,
  onRemove,
  onAddToCart,
  isOutOfStock = false,
  originalPrice,
  className,
}: WishlistItemProps) {
  const [isFavorited, setIsFavorited] = useState(() => isInGuestWishlist(product.id));

  // Price change detection
  const priceChanged = originalPrice !== undefined && originalPrice !== product.price;
  const priceDecreased = priceChanged && product.price < (originalPrice || 0);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(originalPrice)
    : null;

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);

    try {
      if (newFavoritedState) {
        addToGuestWishlist(product.id);
        toast.success('Added to wishlist');
      } else {
        removeFromGuestWishlist(product.id);
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      setIsFavorited(isFavorited);
      toast.error('Failed to update wishlist');
    }
  };

  const handleRemoveClick = () => {
    try {
      removeFromGuestWishlist(product.id);
      toast.success('Removed from wishlist');
      onRemove?.(product.id);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This item is out of stock');
      return;
    }
    onAddToCart?.(product);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 rounded-lg bg-card border',
        'transition-all duration-200',
        'hover:shadow-md',
        className
      )}
    >
      {/* Header - Product Info and Actions */}
      <div className="flex gap-3 sm:items-start sm:gap-4">
        {/* Product Image - Mobile/Tablet */}
        <div className="flex h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24 md:hidden lg:flex lg:h-32 lg:w-32">
          {/* TODO: Add Image component when wishlist items are implemented */}
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            {product.name}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col gap-1">
          {/* Name and Category */}
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {product.category}
            </span>
            <h3 className="font-serif text-base font-medium leading-tight text-foreground line-clamp-1">
              {product.name}
            </h3>
          </div>

          {/* Price with Change Indicator */}
          <div className="flex items-baseline gap-2">
            <p className="text-sm">
              {priceDecreased ? (
                <>
                  <span className="line-through text-muted-foreground">
                    {formattedOriginalPrice}
                  </span>
                  <span className="ml-2 text-lg font-semibold text-green-600">
                    {formattedPrice}
                  </span>
                  <span className="ml-2 text-xs font-medium text-green-600">
                    Lower price!
                  </span>
                </>
              ) : priceChanged ? (
                <>
                  <span className="text-lg font-semibold text-foreground">
                    {formattedPrice}
                  </span>
                  <span className="ml-2 text-xs font-medium text-orange-600">
                    Price changed
                  </span>
                </>
              ) : (
                <span className="text-lg font-semibold text-foreground">
                  {formattedPrice}
                </span>
              )}
            </p>
          </div>

          {/* Stock Status */}
          {isOutOfStock && (
            <p className="text-sm font-medium text-red-600">
              No longer available
            </p>
          )}
        </div>

        {/* Actions - Desktop Only */}
        <div className="hidden flex gap-2 lg:flex lg:flex-col">
          {/* Remove Button */}
          <button
            onClick={handleRemoveClick}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md',
              'border border-input bg-background',
              'hover:bg-destructive hover:text-destructive-foreground',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
            aria-label="Remove from wishlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md',
              'border border-input bg-background',
              'hover:bg-accent hover:text-accent-foreground',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors duration-200',
                isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
              strokeWidth={isFavorited ? 0 : 2}
            />
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md',
              'border border-input bg-background',
              'hover:bg-accent hover:text-accent-foreground',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              isOutOfStock && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Actions */}
      <div className="flex gap-2 pt-3 lg:hidden">
        <button
          onClick={handleRemoveClick}
          className="flex-1 h-10 items-center justify-center rounded-md border border-input bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="Remove from wishlist"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'flex-1 h-10 items-center justify-center rounded-md',
            'border border-input bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'transition-colors',
            isOutOfStock && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Add to cart"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

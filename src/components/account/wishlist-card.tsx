'use client';

import { Trash2, ShoppingBag, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/types/database.types';
import { removeFromWishlist } from '@/app/account/actions';

interface WishlistCardProps {
  product: Product;
  isOutOfStock?: boolean;
  originalPrice?: number; // For price change detection
  onRemoved?: () => void; // Callback when item is removed
  className?: string;
}

/**
 * WishlistCard Component
 *
 * Displays a wishlist item as a vertical card for grid layout.
 * Designed for authenticated users on wishlist page.
 *
 * @example
 * ```tsx
 * <WishlistCard product={product} onRemoved={() => router.refresh()} />
 * ```
 */
export function WishlistCard({
  product,
  isOutOfStock = false,
  originalPrice,
  onRemoved,
  className,
}: WishlistCardProps) {

  // Get product image URL
  const imageUrl = product.images?.[0] || '/placeholder-product.jpg';

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

  const handleRemoveClick = async () => {
    try {
      const result = await removeFromWishlist(product.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Removed from wishlist');
      onRemoved?.();
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This item is out of stock');
      return;
    }

    // Redirect to product page instead of adding to cart directly
    // User needs to select variants (size, color) before adding to cart
    window.location.href = `/products/${product.category}/${product.slug}`;
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
      {/* Product Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-1">
        {/* Category */}
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category}
        </span>

        {/* Name - Clickable */}
        <Link
          href={`/products/${product.category}/${product.slug}`}
          className="font-serif text-base font-medium leading-tight text-foreground line-clamp-2 hover:text-primary hover:underline transition-colors"
        >
          {product.name}
        </Link>

        {/* Price with Change Indicator */}
        <div className="mt-auto pt-2">
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

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleRemoveClick}
          className="flex-1 h-10 items-center justify-center rounded-md border border-input bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="Remove from wishlist"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </button>
        <Link
          href={`/products/${product.category}/${product.slug}`}
          className={cn(
            'flex-1 h-10 items-center justify-center rounded-md',
            'border border-input bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'transition-colors',
            isOutOfStock && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="View product details"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'View Details' : 'Add to Cart'}
        </Link>
      </div>
    </div>
  );
}

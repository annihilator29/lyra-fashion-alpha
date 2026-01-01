'use client';

import { Heart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EmptyWishlistProps {
  className?: string;
}

/**
 * EmptyWishlist Component
 *
 * Displays empty state message with call-to-action.
 * Follows design aesthetic with friendly messaging.
 *
 * @example
 * ```tsx
 * <EmptyWishlist />
 * ```
 */
export function EmptyWishlist({ className }: EmptyWishlistProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 py-16 px-4 text-center',
        className
      )}
    >
      {/* Heart Icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
        <Heart className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
      </div>

      {/* Message */}
      <div className="max-w-md space-y-2">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Your wishlist is empty
        </h2>
        <p className="text-base text-muted-foreground">
          Save your favorite items to keep track of products you love.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/products"
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg px-6 py-3',
            'bg-primary text-primary-foreground font-medium',
            'hover:bg-primary/90 transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
        >
          <ShoppingBag className="h-5 w-5" />
          Browse Products
        </Link>
      </div>

      {/* Helpful Tip */}
      <p className="max-w-sm text-sm text-muted-foreground">
        💡 Tip: Click the heart icon on any product to save it to your wishlist
      </p>
    </div>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { ProductCardSkeleton } from './product-card-skeleton';
import type { Product } from '@/types/database.types';

interface ProductGridProps {
    products: Product[];
    count?: number;
    className?: string;
}

/**
 * ProductGrid Component
 *
 * Displays products in a responsive grid layout.
 * 1 column on mobile, 2 on tablet, 4 on desktop.
 */
export function ProductGrid({ products, count, className }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-foreground">
                    No products found
                </h3>
                <p className="max-w-md text-muted-foreground">
                    Try adjusting your filters or browse our other categories.
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Product Count Header */}
            {count !== undefined && (
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{count}</span>{' '}
                    {count === 1 ? 'product' : 'products'}
                </p>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        priority={index < 4} // Priority for first 4 (above the fold)
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * ProductGridSkeleton Component
 *
 * Loading skeleton for product grid.
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {/* Count Skeleton */}
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: count }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

import { cn } from '@/lib/utils';

interface ProductCardSkeletonProps {
    className?: string;
}

/**
 * ProductCardSkeleton Component
 *
 * Loading skeleton that matches ProductCard dimensions.
 * Prevents layout shift during data loading.
 */
export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
    return (
        <div
            className={cn(
                'flex flex-col overflow-hidden rounded-lg bg-card',
                className
            )}
        >
            {/* Image Skeleton */}
            <div className="relative aspect-[3/4] w-full animate-pulse bg-muted" />

            {/* Content Skeleton */}
            <div className="flex flex-1 flex-col gap-2 p-4">
                {/* Category Skeleton */}
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />

                {/* Name Skeleton */}
                <div className="h-5 w-full animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />

                {/* Price Skeleton */}
                <div className="mt-auto h-5 w-20 animate-pulse rounded bg-muted pt-2" />
            </div>
        </div>
    );
}

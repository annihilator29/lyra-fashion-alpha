import { ProductGridSkeleton } from '@/components/shop/product-grid';

/**
 * Loading skeleton for category pages.
 * Displays while products are being fetched.
 */
export default function CategoryLoading() {
    return (
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Page Header Skeleton */}
                <div className="mb-8">
                    <div className="h-10 w-48 animate-pulse rounded bg-muted" />
                    <div className="mt-2 h-5 w-72 animate-pulse rounded bg-muted" />
                </div>

                {/* Filters and Products Layout */}
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    {/* Filter Sidebar Skeleton (desktop only) */}
                    <aside className="hidden w-64 flex-shrink-0 lg:block">
                        <div className="space-y-6">
                            <div className="h-6 w-20 animate-pulse rounded bg-muted" />
                            {/* Size filter skeleton */}
                            <div className="space-y-3">
                                <div className="h-5 w-12 animate-pulse rounded bg-muted" />
                                <div className="space-y-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                                            <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Color filter skeleton */}
                            <div className="space-y-3">
                                <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-8 w-8 animate-pulse rounded-full bg-muted"
                                        />
                                    ))}
                                </div>
                            </div>
                            {/* Price filter skeleton */}
                            <div className="space-y-3">
                                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                                <div className="flex items-center gap-2">
                                    <div className="h-9 w-24 animate-pulse rounded bg-muted" />
                                    <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                                    <div className="h-9 w-24 animate-pulse rounded bg-muted" />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {/* Sort Controls Skeleton */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                            <div className="h-9 w-44 animate-pulse rounded bg-muted" />
                        </div>

                        {/* Product Grid Skeleton */}
                        <ProductGridSkeleton count={8} />
                    </div>
                </div>
            </div>
        </main>
    );
}

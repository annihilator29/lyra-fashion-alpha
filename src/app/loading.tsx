import { ProductCardSkeleton } from '@/components/shop/product-card-skeleton';

/**
 * Homepage Loading Skeleton
 *
 * Displays a loading skeleton matching the homepage layout
 * to prevent layout shift during data fetching.
 */
export default function HomeLoading() {
    return (
        <main className="min-h-screen">
            {/* Hero Section Skeleton */}
            <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-background to-accent px-4 py-24 sm:px-6 lg:px-8">
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    {/* Tagline Skeleton */}
                    <div className="mx-auto mb-4 h-4 w-40 animate-pulse rounded bg-muted" />

                    {/* Heading Skeleton */}
                    <div className="mx-auto mb-3 h-12 w-full max-w-md animate-pulse rounded bg-muted" />
                    <div className="mx-auto mb-6 h-12 w-full max-w-sm animate-pulse rounded bg-muted" />

                    {/* Description Skeleton */}
                    <div className="mx-auto mb-3 h-6 w-full max-w-2xl animate-pulse rounded bg-muted" />
                    <div className="mx-auto mb-10 h-6 w-full max-w-xl animate-pulse rounded bg-muted" />

                    {/* Buttons Skeleton */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <div className="h-11 w-[200px] animate-pulse rounded-md bg-muted" />
                        <div className="h-11 w-[200px] animate-pulse rounded-md bg-muted" />
                    </div>
                </div>
            </section>

            {/* Value Proposition Skeleton */}
            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className="mb-4 h-16 w-16 animate-pulse rounded-full bg-muted" />
                                <div className="mb-2 h-5 w-32 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Skeleton */}
            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Section Header Skeleton */}
                    <div className="mb-12 text-center">
                        <div className="mx-auto mb-4 h-10 w-64 animate-pulse rounded bg-muted" />
                        <div className="mx-auto h-6 w-96 animate-pulse rounded bg-muted" />
                    </div>

                    {/* Products Grid Skeleton */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Navigation Skeleton */}
            <section className="bg-secondary/50 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Section Header Skeleton */}
                    <div className="mb-12 text-center">
                        <div className="mx-auto mb-4 h-10 w-56 animate-pulse rounded bg-muted" />
                        <div className="mx-auto h-6 w-80 animate-pulse rounded bg-muted" />
                    </div>

                    {/* Categories Grid Skeleton */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center justify-center rounded-lg bg-card p-6 shadow-sm"
                            >
                                <div className="mb-4 h-16 w-16 animate-pulse rounded-full bg-muted" />
                                <div className="mb-1 h-5 w-20 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

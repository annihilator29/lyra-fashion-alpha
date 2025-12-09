'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { FilterSidebar } from '@/components/shop/filter-sidebar';
import { SortDropdown } from '@/components/shop/sort-dropdown';
import { ProductGrid } from '@/components/shop/product-grid';
import type { Product } from '@/types/database.types';
import type { ProductFilters, SortOption } from '@/types/product';

interface CategoryFiltersProps {
    category: string;
    initialProducts: Product[];
    initialCount: number;
    initialFilters: ProductFilters;
    initialSort: SortOption;
}

/**
 * CategoryFilters Component
 *
 * Client component that manages filter/sort state and URL synchronization.
 * Wraps FilterSidebar, SortDropdown, and ProductGrid.
 */
export function CategoryFilters({
    category,
    initialProducts,
    initialCount,
    initialFilters,
    initialSort,
}: CategoryFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [filters, setFilters] = useState<ProductFilters>(initialFilters);
    const [sort, setSort] = useState<SortOption>(initialSort);

    // Update URL with new filters/sort
    const updateURL = useCallback(
        (newFilters: ProductFilters, newSort: SortOption) => {
            const params = new URLSearchParams();

            // Add size params
            if (newFilters.sizes && newFilters.sizes.length > 0) {
                params.set('size', newFilters.sizes.join(','));
            }

            // Add color params
            if (newFilters.colors && newFilters.colors.length > 0) {
                params.set('color', newFilters.colors.join(','));
            }

            // Add price params
            if (newFilters.priceMin !== undefined) {
                params.set('priceMin', String(newFilters.priceMin));
            }
            if (newFilters.priceMax !== undefined) {
                params.set('priceMax', String(newFilters.priceMax));
            }

            // Add in stock param
            if (newFilters.inStock) {
                params.set('inStock', 'true');
            }

            // Add sort param (only if not default)
            if (newSort !== 'newest') {
                params.set('sort', newSort);
            }

            const queryString = params.toString();
            const url = queryString ? `${pathname}?${queryString}` : pathname;

            startTransition(() => {
                router.push(url, { scroll: false });
            });
        },
        [pathname, router]
    );

    // Handle filter changes
    const handleFiltersChange = useCallback(
        (newFilters: ProductFilters) => {
            setFilters(newFilters);
            updateURL(newFilters, sort);
        },
        [sort, updateURL]
    );

    // Handle sort changes
    const handleSortChange = useCallback(
        (newSort: SortOption) => {
            setSort(newSort);
            updateURL(filters, newSort);
        },
        [filters, updateURL]
    );

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            {/* Filter Sidebar */}
            <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                className="w-64 flex-shrink-0"
            />

            {/* Main Content Area */}
            <div className="flex-1">
                {/* Sort Controls */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {isPending ? (
                            'Loading...'
                        ) : (
                            <>
                                Showing <span className="font-medium text-foreground">{initialCount}</span>{' '}
                                {initialCount === 1 ? 'product' : 'products'}
                            </>
                        )}
                    </p>
                    <SortDropdown value={sort} onValueChange={handleSortChange} />
                </div>

                {/* Product Grid */}
                <div className={isPending ? 'opacity-50 transition-opacity' : ''}>
                    <ProductGrid products={initialProducts} />
                </div>
            </div>
        </div>
    );
}

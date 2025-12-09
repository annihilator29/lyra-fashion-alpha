'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
    SIZE_OPTIONS,
    COLOR_OPTIONS,
    type ProductFilters,
} from '@/types/product';

interface FilterSidebarProps {
    filters: ProductFilters;
    onFiltersChange: (filters: ProductFilters) => void;
    className?: string;
}

/**
 * FilterSidebar Component
 *
 * Provides filtering controls for product listings.
 * Desktop: Shows as sidebar. Mobile: Opens as slide-over sheet.
 */
export function FilterSidebar({
    filters,
    onFiltersChange,
    className,
}: FilterSidebarProps) {
    const hasActiveFilters =
        (filters.sizes && filters.sizes.length > 0) ||
        (filters.colors && filters.colors.length > 0) ||
        filters.priceMin !== undefined ||
        filters.priceMax !== undefined ||
        filters.inStock;

    const clearAllFilters = () => {
        onFiltersChange({});
    };

    const toggleSize = (size: string) => {
        const currentSizes = filters.sizes || [];
        const newSizes = currentSizes.includes(size)
            ? currentSizes.filter((s) => s !== size)
            : [...currentSizes, size];
        onFiltersChange({ ...filters, sizes: newSizes.length > 0 ? newSizes : undefined });
    };

    const toggleColor = (color: string) => {
        const currentColors = filters.colors || [];
        const newColors = currentColors.includes(color)
            ? currentColors.filter((c) => c !== color)
            : [...currentColors, color];
        onFiltersChange({ ...filters, colors: newColors.length > 0 ? newColors : undefined });
    };

    const updatePriceRange = (min?: number, max?: number) => {
        onFiltersChange({
            ...filters,
            priceMin: min,
            priceMax: max,
        });
    };

    const toggleInStock = () => {
        onFiltersChange({
            ...filters,
            inStock: filters.inStock ? undefined : true,
        });
    };

    // Filter content shared between desktop sidebar and mobile sheet
    const FilterContent = () => (
        <div className="space-y-6">
            {/* Clear All Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                    <X className="mr-2 h-4 w-4" />
                    Clear all filters
                </Button>
            )}

            {/* Size Filter */}
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Size</h3>
                <div className="space-y-2">
                    {SIZE_OPTIONS.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                            <Checkbox
                                id={`size-${size}`}
                                checked={filters.sizes?.includes(size) || false}
                                onCheckedChange={() => toggleSize(size)}
                            />
                            <Label
                                htmlFor={`size-${size}`}
                                className="cursor-pointer text-sm font-normal"
                            >
                                {size}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Color</h3>
                <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => toggleColor(color.value)}
                            title={color.label}
                            className={cn(
                                'h-8 w-8 rounded-full border-2 transition-all',
                                filters.colors?.includes(color.value)
                                    ? 'ring-2 ring-primary ring-offset-2'
                                    : 'border-muted hover:border-foreground/50'
                            )}
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}
                </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Price Range</h3>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        value={filters.priceMin ?? ''}
                        onChange={(e) =>
                            updatePriceRange(
                                e.target.value ? Number(e.target.value) : undefined,
                                filters.priceMax
                            )
                        }
                        className="w-24"
                        min={0}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={filters.priceMax ?? ''}
                        onChange={(e) =>
                            updatePriceRange(
                                filters.priceMin,
                                e.target.value ? Number(e.target.value) : undefined
                            )
                        }
                        className="w-24"
                        min={0}
                    />
                </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Availability</h3>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="in-stock"
                        checked={filters.inStock || false}
                        onCheckedChange={toggleInStock}
                    />
                    <Label
                        htmlFor="in-stock"
                        className="cursor-pointer text-sm font-normal"
                    >
                        In Stock Only
                    </Label>
                </div>
            </div>
        </div>
    );

    // Applied filters badges
    const AppliedFilters = () => {
        if (!hasActiveFilters) return null;

        const badges: { label: string; onRemove: () => void }[] = [];

        filters.sizes?.forEach((size) => {
            badges.push({
                label: `Size: ${size}`,
                onRemove: () => toggleSize(size),
            });
        });

        filters.colors?.forEach((color) => {
            const colorOption = COLOR_OPTIONS.find((c) => c.value === color);
            badges.push({
                label: `Color: ${colorOption?.label || color}`,
                onRemove: () => toggleColor(color),
            });
        });

        if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
            const label =
                filters.priceMin !== undefined && filters.priceMax !== undefined
                    ? `$${filters.priceMin} - $${filters.priceMax}`
                    : filters.priceMin !== undefined
                        ? `From $${filters.priceMin}`
                        : `Up to $${filters.priceMax}`;
            badges.push({
                label,
                onRemove: () => updatePriceRange(undefined, undefined),
            });
        }

        if (filters.inStock) {
            badges.push({
                label: 'In Stock',
                onRemove: toggleInStock,
            });
        }

        return (
            <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                    >
                        {badge.label}
                        <button
                            onClick={badge.onRemove}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Filter Button + Sheet */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    {(filters.sizes?.length || 0) +
                                        (filters.colors?.length || 0) +
                                        (filters.priceMin !== undefined || filters.priceMax !== undefined
                                            ? 1
                                            : 0) +
                                        (filters.inStock ? 1 : 0)}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <FilterContent />
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Applied filters badges (mobile) */}
                <div className="mt-4">
                    <AppliedFilters />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className={cn('hidden lg:block', className)}>
                <div className="sticky top-4 space-y-6">
                    <h2 className="font-serif text-lg font-semibold text-foreground">
                        Filters
                    </h2>
                    <FilterContent />
                    <AppliedFilters />
                </div>
            </aside>
        </>
    );
}

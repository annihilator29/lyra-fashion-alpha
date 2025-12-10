'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { ProductVariantRow } from '@/types/product';

interface VariantSelectorProps {
    variants: ProductVariantRow[];
    basePrice: number;
    onVariantChange?: (variant: ProductVariantRow | null) => void;
    onImageChange?: (imageUrl: string | null) => void;
    className?: string;
}

/**
 * VariantSelector Component
 *
 * Size and color selection with real-time stock availability tracking.
 * Displays stock quantity and handles out-of-stock states.
 *
 * @example
 * ```tsx
 * <VariantSelector
 *   variants={product.product_variants}
 *   basePrice={product.price}
 *   onVariantChange={(v) => setSelectedVariant(v)}
 * />
 * ```
 */
export function VariantSelector({
    variants,
    basePrice,
    onVariantChange,
    onImageChange,
    className,
}: VariantSelectorProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    // Extract unique sizes and colors from variants
    const { availableSizes, availableColors } = useMemo(() => {
        const sizes = new Set<string>();
        const colors = new Map<string, string | null>(); // color -> color_hex

        variants.forEach((v) => {
            sizes.add(v.size);
            if (!colors.has(v.color)) {
                colors.set(v.color, v.color_hex);
            }
        });

        return {
            availableSizes: Array.from(sizes).sort((a, b) => {
                const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
                return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
            }),
            availableColors: Array.from(colors.entries()).map(([color, hex]) => ({
                color,
                hex,
            })),
        };
    }, [variants]);

    // Find selected variant
    const selectedVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return variants.find(
            (v) => v.size === selectedSize && v.color === selectedColor
        ) || null;
    }, [variants, selectedSize, selectedColor]);

    // Check if a size is available for the selected color
    const isSizeAvailable = useCallback(
        (size: string) => {
            if (!selectedColor) {
                // If no color selected, check if any variant with this size has stock
                return variants.some((v) => v.size === size && v.stock_quantity > 0);
            }
            const variant = variants.find(
                (v) => v.size === size && v.color === selectedColor
            );
            return variant ? variant.stock_quantity > 0 : false;
        },
        [variants, selectedColor]
    );

    // Check if a color is available for the selected size
    const isColorAvailable = useCallback(
        (color: string) => {
            if (!selectedSize) {
                // If no size selected, check if any variant with this color has stock
                return variants.some((v) => v.color === color && v.stock_quantity > 0);
            }
            const variant = variants.find(
                (v) => v.color === color && v.size === selectedSize
            );
            return variant ? variant.stock_quantity > 0 : false;
        },
        [variants, selectedSize]
    );

    // Notify parent of variant change
    useEffect(() => {
        onVariantChange?.(selectedVariant);

        // If variant has a specific image, notify parent
        if (selectedVariant?.image_url) {
            onImageChange?.(selectedVariant.image_url);
        }
    }, [selectedVariant, onVariantChange, onImageChange]);

    // Calculate display price with modifier
    const displayPrice = useMemo(() => {
        const modifier = selectedVariant?.price_modifier ?? 0;
        return basePrice + modifier;
    }, [basePrice, selectedVariant]);

    const handleSizeSelect = useCallback((size: string) => {
        setSelectedSize((prev) => (prev === size ? null : size));
    }, []);

    const handleColorSelect = useCallback((color: string) => {
        setSelectedColor((prev) => (prev === color ? null : color));
    }, []);

    // Format price in USD
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(displayPrice);

    // If no variants, show a message
    if (!variants || variants.length === 0) {
        return (
            <div className={cn('space-y-6', className)}>
                <p className="text-muted-foreground">
                    This product has a single variant. Add to cart to purchase.
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Size Selector */}
            {availableSizes.length > 0 && (
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">Size</h3>
                        {selectedSize && (
                            <span className="text-sm text-muted-foreground">
                                Selected: {selectedSize}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
                        {availableSizes.map((size) => {
                            const isAvailable = isSizeAvailable(size);
                            const isSelected = selectedSize === size;

                            return (
                                <button
                                    key={size}
                                    onClick={() => handleSizeSelect(size)}
                                    disabled={!isAvailable}
                                    className={cn(
                                        'relative min-w-[48px] rounded-md border px-4 py-2 text-sm font-medium transition-all',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                        isSelected
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : isAvailable
                                                ? 'border-border bg-background text-foreground hover:border-primary/50'
                                                : 'cursor-not-allowed border-border/50 bg-muted text-muted-foreground line-through'
                                    )}
                                    role="radio"
                                    aria-checked={isSelected}
                                    aria-disabled={!isAvailable}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Color Selector */}
            {availableColors.length > 0 && (
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">Color</h3>
                        {selectedColor && (
                            <span className="text-sm text-muted-foreground">
                                Selected: {selectedColor}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Select color">
                        {availableColors.map(({ color, hex }) => {
                            const isAvailable = isColorAvailable(color);
                            const isSelected = selectedColor === color;

                            return (
                                <button
                                    key={color}
                                    onClick={() => handleColorSelect(color)}
                                    disabled={!isAvailable}
                                    className={cn(
                                        'group relative flex items-center gap-2 rounded-md border px-3 py-2 transition-all',
                                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                        isSelected
                                            ? 'border-primary bg-primary/5'
                                            : isAvailable
                                                ? 'border-border bg-background hover:border-primary/50'
                                                : 'cursor-not-allowed border-border/50 bg-muted opacity-50'
                                    )}
                                    role="radio"
                                    aria-checked={isSelected}
                                    aria-disabled={!isAvailable}
                                    title={color}
                                >
                                    {/* Color swatch */}
                                    <span
                                        className={cn(
                                            'relative h-6 w-6 rounded-full border transition-all',
                                            isSelected
                                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                : 'border-border'
                                        )}
                                        style={{
                                            backgroundColor: hex || '#ccc',
                                        }}
                                    >
                                        {isSelected && (
                                            <Check
                                                className={cn(
                                                    'absolute inset-0 m-auto h-4 w-4',
                                                    hex && isLightColor(hex)
                                                        ? 'text-foreground'
                                                        : 'text-white'
                                                )}
                                            />
                                        )}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-sm capitalize',
                                            !isAvailable && 'line-through'
                                        )}
                                    >
                                        {color}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Stock & Price Display */}
            <div className="space-y-2 border-t pt-4">
                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-foreground">
                        {formattedPrice}
                    </span>
                    {selectedVariant?.price_modifier !== undefined &&
                        selectedVariant.price_modifier !== 0 && (
                            <span className="text-sm text-muted-foreground">
                                (${selectedVariant.price_modifier > 0 ? '+' : ''}
                                {selectedVariant.price_modifier.toFixed(2)})
                            </span>
                        )}
                </div>

                {/* Stock Status */}
                {selectedVariant ? (
                    <div className="flex items-center gap-2">
                        {selectedVariant.stock_quantity > 0 ? (
                            <>
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-sm text-green-600 dark:text-green-400">
                                    {selectedVariant.stock_quantity <= 5
                                        ? `Only ${selectedVariant.stock_quantity} left in stock`
                                        : 'In Stock'}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-sm text-red-600 dark:text-red-400">
                                    Out of Stock
                                </span>
                            </>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Select size and color to see availability
                    </p>
                )}

                {/* Selected Variant Info */}
                {selectedVariant && (
                    <p className="text-xs text-muted-foreground">
                        SKU: {selectedVariant.sku}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Helper function to determine if a hex color is light.
 */
function isLightColor(hex: string): boolean {
    // Remove # if present
    const cleanHex = hex.replace('#', '');

    // Parse RGB values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Calculate perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 155;
}

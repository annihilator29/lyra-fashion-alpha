'use client';

import { useState, useCallback } from 'react';
import { ImageGallery } from '@/components/shop/image-gallery';
import { VariantSelector } from '@/components/shop/variant-selector';
import { SizeGuideModal } from '@/components/shop/size-guide-modal';
import { CraftsmanshipSection } from '@/components/transparency/craftsmanship-section';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { useCartStore } from '@/lib/cart-store';
import type { ProductWithVariants, ProductVariantRow, CraftsmanshipContent } from '@/types/product';

interface ProductDetailClientProps {
    product: ProductWithVariants;
    craftsmanship: CraftsmanshipContent | null;
}

/**
 * ProductDetailClient Component
 *
 * Client-side interactive portion of the PDP.
 * Handles image gallery, variant selection, and material/care accordion.
 *
 * @example
 * ```tsx
 * <ProductDetailClient product={product} craftsmanship={craftsmanship} />
 * ```
 */
export function ProductDetailClient({ product, craftsmanship }: ProductDetailClientProps) {
    const [selectedVariant, setSelectedVariant] = useState<ProductVariantRow | null>(null);
    const [currentImages, setCurrentImages] = useState<string[]>(product.images || []);
    const setCartOpen = useCartStore((state) => state.setIsOpen);

    // Handle variant-specific image changes
    const handleImageChange = useCallback((imageUrl: string | null) => {
        if (imageUrl) {
            // Prepend variant-specific image to the gallery
            setCurrentImages([imageUrl, ...(product.images || []).filter(img => img !== imageUrl)]);
        } else {
            // Reset to original images
            setCurrentImages(product.images || []);
        }
    }, [product.images]);

    // Calculate final price with variant modifier
    const displayPrice = selectedVariant
        ? product.price + (selectedVariant.price_modifier || 0)
        : product.price;

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(displayPrice);

    // Check if we can add to cart
    const canAddToCart = selectedVariant && selectedVariant.stock_quantity > 0;

    return (
        <>
            {/* Left Column - Image Gallery */}
            <div>
                <ImageGallery
                    images={currentImages}
                    productName={product.name}
                />
            </div>

            {/* Right Column - Product Info */}
            <div className="flex flex-col gap-6">
                {/* Product Title and Category */}
                <div>
                    <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        {product.category}
                    </span>
                    <h1 className="mt-1 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                        {product.name}
                    </h1>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-semibold text-foreground">
                        {formattedPrice}
                    </span>
                    {selectedVariant?.price_modifier !== undefined &&
                        selectedVariant.price_modifier !== 0 && (
                            <span className="text-sm text-muted-foreground">
                                (includes size/color adjustment)
                            </span>
                        )}
                </div>

                {/* Description */}
                {product.description && (
                    <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                    </p>
                )}

                {/* Variant Selector with Size Guide */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">
                            Select Options
                        </h3>
                        <SizeGuideModal category={product.category} />
                    </div>
                    <VariantSelector
                        variants={product.product_variants || []}
                        basePrice={product.price}
                        onVariantChange={setSelectedVariant}
                        onImageChange={handleImageChange}
                    />
                </div>

                {/* Add to Cart Button */}
                <div className="space-y-3 border-t pt-6">
                    {selectedVariant && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Selected:</span>
                            <span className="font-medium text-foreground">
                                {selectedVariant.size} / {selectedVariant.color}
                            </span>
                        </div>
                    )}

                    <div className="pt-2">
                        <AddToCartButton
                            product={product}
                            selectedSize={selectedVariant?.size || null}
                            selectedColor={selectedVariant?.color || null}
                            price={displayPrice}
                            onCartOpen={() => setCartOpen(true)}
                        />
                    </div>

                    {!canAddToCart && selectedVariant && (
                        <p className="text-center text-sm text-muted-foreground">
                            This variant is currently out of stock.
                        </p>
                    )}
                </div>

                {/* Craftsmanship Section */}
                <CraftsmanshipSection craftsmanship={craftsmanship} className="mt-6" />
            </div>
        </>
    );
}

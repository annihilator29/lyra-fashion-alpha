'use client';

import { useState, useCallback } from 'react';
import { ImageGallery } from '@/components/shop/image-gallery';
import { VariantSelector } from '@/components/shop/variant-selector';
import { SizeGuideModal } from '@/components/shop/size-guide-modal';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronDown, ChevronUp, Sparkles, Leaf } from 'lucide-react';
import type { ProductWithVariants, ProductVariantRow, CraftsmanshipContent } from '@/types/product';
import { cn } from '@/lib/utils';

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
    const [materialExpanded, setMaterialExpanded] = useState(false);
    const [careExpanded, setCareExpanded] = useState(false);

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

                    <Button
                        size="lg"
                        className="w-full gap-2"
                        disabled={!canAddToCart}
                    >
                        <ShoppingBag className="h-5 w-5" />
                        {!selectedVariant
                            ? 'Select Size & Color'
                            : selectedVariant.stock_quantity === 0
                                ? 'Out of Stock'
                                : 'Add to Cart'}
                    </Button>

                    {!canAddToCart && selectedVariant && (
                        <p className="text-center text-sm text-muted-foreground">
                            This variant is currently out of stock.
                        </p>
                    )}

                    {!selectedVariant && (product.product_variants?.length ?? 0) > 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                            Please select your size and color to add to cart.
                        </p>
                    )}
                </div>

                {/* Material & Care Accordions */}
                <div className="space-y-2 border-t pt-6">
                    {/* Material Section */}
                    {craftsmanship?.material && (
                        <div className="rounded-lg border">
                            <button
                                onClick={() => setMaterialExpanded(!materialExpanded)}
                                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
                                aria-expanded={materialExpanded}
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground">Material & Composition</span>
                                </div>
                                {materialExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                            <div
                                className={cn(
                                    'overflow-hidden transition-all duration-200',
                                    materialExpanded ? 'max-h-96' : 'max-h-0'
                                )}
                            >
                                <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                                    <p>{craftsmanship.material}</p>
                                    {craftsmanship.origin && (
                                        <p className="mt-2">
                                            <strong className="text-foreground">Origin:</strong> {craftsmanship.origin}
                                        </p>
                                    )}
                                    {craftsmanship.sustainability && (
                                        <p className="mt-2">
                                            <strong className="text-foreground">Sustainability:</strong> {craftsmanship.sustainability}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Care Instructions Section */}
                    {craftsmanship?.care_instructions && craftsmanship.care_instructions.length > 0 && (
                        <div className="rounded-lg border">
                            <button
                                onClick={() => setCareExpanded(!careExpanded)}
                                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
                                aria-expanded={careExpanded}
                            >
                                <div className="flex items-center gap-2">
                                    <Leaf className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground">Care Instructions</span>
                                </div>
                                {careExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>
                            <div
                                className={cn(
                                    'overflow-hidden transition-all duration-200',
                                    careExpanded ? 'max-h-96' : 'max-h-0'
                                )}
                            >
                                <ul className="border-t px-4 py-3 space-y-1">
                                    {craftsmanship.care_instructions.map((instruction, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                                            {instruction}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Artisan Notes Section */}
                    {craftsmanship?.artisan_notes && (
                        <div className="rounded-lg border bg-muted/20 px-4 py-3">
                            <p className="text-sm italic text-muted-foreground">
                                &ldquo;{craftsmanship.artisan_notes}&rdquo;
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">— Lyra Fashion Artisan</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

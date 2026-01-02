'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageGallery } from '@/components/shop/image-gallery';
import { VariantSelector } from '@/components/shop/variant-selector';
import { SizeGuideModal } from '@/components/shop/size-guide-modal';
import { CraftsmanshipSection } from '@/components/transparency/craftsmanship-section';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import { isInGuestWishlist, addToGuestWishlist, removeFromGuestWishlist } from '@/lib/wishlist-utils';
import { createClient } from '@/lib/supabase/client';
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
    const [isFavorited, setIsFavorited] = useState(false);
    const setCartOpen = useCartStore((state) => state.setIsOpen);
    const router = useRouter();

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

    // Handle favorite toggle with optimistic UI
    const handleFavoriteClick = async () => {
        // Check authentication
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            toast.error('Please login first to manage your wishlist');
            router.push('/login');
            return;
        }

        const newFavoritedState = !isFavorited;
        setIsFavorited(newFavoritedState);

        // Guest user - use localStorage utilities
        if (!user) {
            try {
                if (newFavoritedState) {
                    addToGuestWishlist(product.id);
                    toast.success('Added to wishlist');
                } else {
                    removeFromGuestWishlist(product.id);
                    toast.success('Removed from wishlist');
                }
            } catch {
                setIsFavorited(isFavorited);
                toast.error('Failed to update wishlist');
            }
            return;
        }

        // Authenticated user - call server action
        try {
            const { addToWishlist, removeFromWishlist } = await import('@/app/account/actions');

            if (newFavoritedState) {
                const result = await addToWishlist(product.id);
                if (result.error) {
                    setIsFavorited(isFavorited);
                    toast.error(result.error);
                } else {
                    toast.success('Added to wishlist');
                }
            } else {
                const result = await removeFromWishlist(product.id);
                if (result.error) {
                    setIsFavorited(isFavorited);
                    toast.error(result.error);
                } else {
                    toast.success('Removed from wishlist');
                }
            }
        } catch {
            setIsFavorited(isFavorited);
            toast.error('Failed to update wishlist');
        }
    };

    // Check actual wishlist status when component mounts
    useEffect(() => {
        const checkWishlistStatus = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                // Guest users: check localStorage
                if (!user) {
                    const inGuestWishlist = isInGuestWishlist(product.id);
                    setIsFavorited(inGuestWishlist);
                    return;
                }

                // Authenticated users: check database
                const { data } = await supabase
                    .from('wishlist_items')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('product_id', product.id)
                    .single();

                setIsFavorited(!!data);
            } catch (error) {
                console.error('Error checking wishlist status:', error);
                setIsFavorited(false);
            }
        };

        checkWishlistStatus();
    }, [product.id]);

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
                        <div className="flex gap-3">
                            <AddToCartButton
                                product={product}
                                selectedSize={selectedVariant?.size || null}
                                selectedColor={selectedVariant?.color || null}
                                price={displayPrice}
                                onCartOpen={() => setCartOpen(true)}
                            />
                            <button
                                onClick={handleFavoriteClick}
                                className={cn(
                                    'flex h-14 flex-1 items-center justify-center rounded-lg',
                                    'bg-background',
                                    'hover:bg-accent hover:text-accent-foreground',
                                    'transition-colors duration-200',
                                    'focus:outline-none focus:ring-2 focus:ring-primary'
                                )}
                                aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <Heart
                                    className={cn(
                                        'h-6 w-6',
                                        isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                    )}
                                    strokeWidth={isFavorited ? 0 : 2}
                                />
                            </button>
                        </div>
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

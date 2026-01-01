'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/types/database.types';
import { isInGuestWishlist, addToGuestWishlist, removeFromGuestWishlist } from '@/lib/wishlist-utils';

interface ProductCardProps {
    product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'images' | 'category'>;
    priority?: boolean;
    className?: string;
}

/**
 * ProductCard Component
 *
 * Displays a product with image, name, price, category, and favorite button.
 * Follows "Organic Modern" design aesthetic with hover effects.
 *
 * @example
 * ```tsx
 * <ProductCard product={product} />
 * ```
 */
export function ProductCard({ product, priority = false, className }: ProductCardProps) {
    const { name, slug, price, images, category, id } = product;
    const imageUrl = images?.[0] || '/placeholder-product.jpg';

    // Optimistic favorite state
    const [isFavorited, setIsFavorited] = useState(() => isInGuestWishlist(id));

    // Format price in USD
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);

    const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update - toggle immediately
        const newFavoritedState = !isFavorited;
        setIsFavorited(newFavoritedState);

        try {
            if (newFavoritedState) {
                addToGuestWishlist(id);
                toast.success('Added to wishlist');
            } else {
                removeFromGuestWishlist(id);
                toast.success('Removed from wishlist');
            }
        } catch (error) {
            // Revert on error
            setIsFavorited(isFavorited);
            toast.error('Failed to update wishlist');
        }
    };

    return (
        <Link
            href={`/products/${category}/${slug}`}
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-lg bg-card transition-all duration-300',
                'hover:shadow-lg hover:-translate-y-1',
                className
            )}
        >
            {/* Product Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={priority}
                    loading={priority ? 'eager' : 'lazy'}
                />

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className={cn(
                        'absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full',
                        'bg-white/90 backdrop-blur-sm shadow-md transition-all duration-200',
                        'hover:bg-white hover:scale-110',
                        'focus:outline-none focus:ring-2 focus:ring-primary'
                    )}
                    aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        className={cn(
                            'h-5 w-5 transition-colors duration-200',
                            isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        )}
                        strokeWidth={isFavorited ? 0 : 2}
                    />
                </button>
            </div>

            {/* Product Info */}
            <div className="flex flex-1 flex-col gap-1 p-4">
                {/* Category */}
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {category}
                </span>

                {/* Name */}
                <h3 className="font-serif text-lg font-medium leading-tight text-foreground line-clamp-2">
                    {name}
                </h3>

                {/* Price */}
                <p className="mt-auto pt-2 text-base font-semibold text-foreground">{formattedPrice}</p>
            </div>
        </Link>
    );
}

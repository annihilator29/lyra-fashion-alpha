'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/database.types';

interface ProductCardProps {
    product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'images' | 'category'>;
    priority?: boolean;
    className?: string;
}

/**
 * ProductCard Component
 *
 * Displays a product with image, name, price, and category.
 * Follows "Organic Modern" design aesthetic with hover effects.
 *
 * @example
 * ```tsx
 * <ProductCard product={product} />
 * ```
 */
export function ProductCard({ product, priority = false, className }: ProductCardProps) {
    const { name, slug, price, images, category } = product;
    const imageUrl = images?.[0] || '/placeholder-product.jpg';

    // Format price in USD
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);

    return (
        <Link
            href={`/products/${slug}`}
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

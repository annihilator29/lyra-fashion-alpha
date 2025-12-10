import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/product-card';
import type { Product } from '@/types/database.types';

interface RelatedProductsProps {
    currentProductId: string;
    category: string;
    className?: string;
}

/**
 * RelatedProducts Component
 *
 * Server component that fetches and displays 4 related products
 * from the same category, excluding the current product.
 *
 * @example
 * ```tsx
 * <RelatedProducts currentProductId={product.id} category={product.category} />
 * ```
 */
export async function RelatedProducts({
    currentProductId,
    category,
    className,
}: RelatedProductsProps) {
    const supabase = await createClient();

    // Fetch 4 related products from the same category
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, slug, price, images, category')
        .eq('category', category)
        .neq('id', currentProductId)
        .order('created_at', { ascending: false })
        .limit(4);

    if (error) {
        console.error('Error fetching related products:', error);
        return null;
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className={className} aria-labelledby="related-products-heading">
            <h2
                id="related-products-heading"
                className="mb-6 font-serif text-2xl font-semibold text-foreground"
            >
                You May Also Like
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'images' | 'category'>) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}

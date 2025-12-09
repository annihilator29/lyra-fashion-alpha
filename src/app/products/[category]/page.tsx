import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VALID_CATEGORIES, type ProductCategory, type SortOption } from '@/types/product';
import type { Product } from '@/types/database.types';
import { CategoryFilters } from '@/app/products/[category]/category-filters';

// ISR: Revalidate every hour
export const revalidate = 3600;

// Generate static params for all valid categories
export function generateStaticParams() {
    return VALID_CATEGORIES.map((category) => ({ category }));
}

// Generate metadata for each category page
export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string }>;
}): Promise<Metadata> {
    const { category } = await params;

    // Validate category
    if (!VALID_CATEGORIES.includes(category as ProductCategory)) {
        return {
            title: 'Category Not Found | Lyra Fashion',
        };
    }

    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        title: `Shop ${categoryTitle} | Lyra Fashion`,
        description: `Browse our collection of ${category}. Factory-direct women's fashion with artisan quality and exceptional value.`,
        openGraph: {
            title: `Shop ${categoryTitle} | Lyra Fashion`,
            description: `Browse our collection of ${category}. Factory-direct women's fashion with artisan quality.`,
            type: 'website',
        },
    };
}

interface PageProps {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Fetch products from Supabase with filters and sorting
async function getProducts(
    category: string,
    searchParams: { [key: string]: string | string[] | undefined }
): Promise<{ products: Product[]; count: number }> {
    const supabase = await createClient();

    // Build query
    let query = supabase
        .from('products')
        .select('id, name, slug, description, price, images, category, craftsmanship_content, transparency_data, created_at, updated_at', { count: 'exact' })
        .eq('category', category);

    // Apply price filters
    const priceMin = searchParams.priceMin;
    const priceMax = searchParams.priceMax;

    if (priceMin && typeof priceMin === 'string') {
        query = query.gte('price', Number(priceMin));
    }
    if (priceMax && typeof priceMax === 'string') {
        query = query.lte('price', Number(priceMax));
    }

    // Apply sorting
    const sort = (searchParams.sort as SortOption) || 'newest';
    switch (sort) {
        case 'price-asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price-desc':
            query = query.order('price', { ascending: false });
            break;
        case 'popularity':
            // TODO: Add popularity_score column to products table
            // Fallback to newest until column is added
            query = query.order('created_at', { ascending: false });
            break;
        case 'craft-rating':
            // TODO: Add craft_rating column to products table
            // Fallback to newest until column is added
            query = query.order('created_at', { ascending: false });
            break;
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false });
            break;
    }

    // Limit to 20 products
    query = query.limit(20);

    const { data: products, error, count } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return { products: [], count: 0 };
    }

    return { products: products || [], count: count || 0 };
}

export default async function ProductListingPage({ params, searchParams }: PageProps) {
    const { category } = await params;
    const filters = await searchParams;

    // Validate category
    if (!VALID_CATEGORIES.includes(category as ProductCategory)) {
        notFound();
    }

    // Fetch products
    const { products } = await getProducts(category, filters);

    // Category display name
    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/50 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900" />
            <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-amber-200/10 to-transparent blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                        {categoryTitle}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Discover our curated collection of {category}
                    </p>
                </div>

                {/* Filters and Products */}
                <CategoryFilters
                    initialProducts={products}
                    initialFilters={{
                        priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
                        priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
                        sizes: filters.size ? (Array.isArray(filters.size) ? filters.size : filters.size.split(',')) : undefined,
                        colors: filters.color ? (Array.isArray(filters.color) ? filters.color : filters.color.split(',')) : undefined,
                        inStock: filters.inStock === 'true',
                    }}
                    initialSort={(filters.sort as SortOption) || 'newest'}
                />
            </div>
        </main>
    );
}

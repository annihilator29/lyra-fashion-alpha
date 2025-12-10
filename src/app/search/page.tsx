import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/product-card';
import { ProductCardSkeleton } from '@/components/shop/product-card-skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { Product } from '@/types/database.types';

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
    searchParams,
}: SearchPageProps): Promise<Metadata> {
    const params = await searchParams;
    const query = params.q || '';

    return {
        title: query
            ? `Search results for "${query}" | Lyra Fashion`
            : 'Search | Lyra Fashion',
        description: query
            ? `Find products matching "${query}" at Lyra Fashion`
            : 'Search our collection of handcrafted fashion',
    };
}

async function getSearchResults(query: string): Promise<Product[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const supabase = await createClient();
    const trimmedQuery = query.trim();

    // Try to use ilike for pattern matching (fallback approach)
    const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, description, price, images, category, craftsmanship_content, transparency_data, created_at, updated_at')
        .or(`name.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%,category.ilike.%${trimmedQuery}%`)
        .order('name')
        .limit(24);

    if (error) {
        console.error('Search error:', error);
        return [];
    }

    return data || [];
}

function SearchResultsLoading() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

async function SearchResults({ query }: { query: string }) {
    const products = await getSearchResults(query);

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="mb-2 font-serif text-2xl font-bold">
                    No products found
                </h2>
                <p className="mb-6 max-w-md text-muted-foreground">
                    We couldn&apos;t find any products matching &ldquo;{query}&rdquo;.
                    Try adjusting your search or browse our categories.
                </p>
                <Button asChild>
                    <Link href="/products">Browse All Products</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <p className="mb-6 text-muted-foreground">
                Found {products.length} product{products.length !== 1 ? 's' : ''} for
                &ldquo;{query}&rdquo;
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        priority={index < 4}
                    />
                ))}
            </div>
        </>
    );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q || '';

    return (
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 font-serif text-3xl font-bold sm:text-4xl">
                        {query ? `Search: "${query}"` : 'Search'}
                    </h1>
                </div>

                {/* Empty Query State */}
                {!query && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="mb-2 font-serif text-2xl font-bold">
                            Start searching
                        </h2>
                        <p className="mb-6 max-w-md text-muted-foreground">
                            Use the search bar above to find products by name,
                            description, or category.
                        </p>
                        <Button asChild>
                            <Link href="/products">Browse All Products</Link>
                        </Button>
                    </div>
                )}

                {/* Search Results */}
                {query && (
                    <Suspense fallback={<SearchResultsLoading />}>
                        <SearchResults query={query} />
                    </Suspense>
                )}
            </div>
        </main>
    );
}

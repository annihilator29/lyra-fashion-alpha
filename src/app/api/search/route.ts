import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SearchSuggestion } from '@/types/product';

/**
 * Search API Route
 *
 * GET /api/search?q={query}
 *
 * Returns up to 8 product suggestions matching the search query.
 * Uses full-text search with Supabase when search_vector is available,
 * otherwise falls back to ilike pattern matching.
 *
 * Response: { suggestions: SearchSuggestion[] }
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validate query length (minimum 2 characters)
    if (!query || query.trim().length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    const trimmedQuery = query.trim();

    try {
        const supabase = await createClient();

        // Try full-text search first (requires search_vector column)
        // Fall back to ilike if textSearch fails or search_vector doesn't exist
        let data;
        let error;

        try {
            // Try full-text search with search_vector
            const result = await supabase
                .from('products')
                .select('id, name, slug, price, images, category')
                .textSearch('search_vector', trimmedQuery, {
                    type: 'websearch',
                    config: 'english',
                })
                .limit(8);

            data = result.data;
            error = result.error;
        } catch {
            // If textSearch fails, fallback to ilike
            error = { message: 'textSearch not available' };
        }

        // Fallback to ilike pattern matching if FTS is not available
        if (error) {
            const result = await supabase
                .from('products')
                .select('id, name, slug, price, images, category')
                .or(`name.ilike.%${trimmedQuery}%,description.ilike.%${trimmedQuery}%,category.ilike.%${trimmedQuery}%`)
                .order('name')
                .limit(8);

            if (result.error) {
                console.error('Search error:', result.error);
                return NextResponse.json(
                    { error: 'Search failed', suggestions: [] },
                    { status: 500 }
                );
            }

            data = result.data;
        }

        // Map results to SearchSuggestion format
        const suggestions: SearchSuggestion[] = (data || []).map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.images?.[0] || null,
            category: product.category,
        }));

        return NextResponse.json({ suggestions });
    } catch (err) {
        console.error('Search API error:', err);
        return NextResponse.json(
            { error: 'Internal server error', suggestions: [] },
            { status: 500 }
        );
    }
}

/**
 * Product Types for Lyra Fashion
 *
 * TypeScript interfaces for product filtering and sorting functionality.
 */

/**
 * Filter state for product listing pages.
 * Used to build Supabase queries and manage URL state.
 */
export interface ProductFilters {
    sizes?: string[];
    colors?: string[];
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
}

/**
 * Available sort options for product listings.
 */
export type SortOption =
    | 'price-asc'
    | 'price-desc'
    | 'newest'
    | 'popularity'
    | 'craft-rating';

/**
 * Valid product categories.
 */
export const VALID_CATEGORIES = [
    'dresses',
    'tops',
    'bottoms',
    'outerwear',
    'accessories',
] as const;

export type ProductCategory = (typeof VALID_CATEGORIES)[number];

/**
 * Sort option labels for UI display.
 */
export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'craft-rating', label: 'Craft Rating' },
];

/**
 * Available size options.
 */
export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL'] as const;

/**
 * Available color options with display values.
 */
export const COLOR_OPTIONS = [
    { value: 'black', label: 'Black', hex: '#000000' },
    { value: 'white', label: 'White', hex: '#FFFFFF' },
    { value: 'beige', label: 'Beige', hex: '#F5F5DC' },
    { value: 'brown', label: 'Brown', hex: '#8B4513' },
    { value: 'navy', label: 'Navy', hex: '#000080' },
    { value: 'green', label: 'Green', hex: '#228B22' },
    { value: 'red', label: 'Red', hex: '#DC143C' },
    { value: 'pink', label: 'Pink', hex: '#FFC0CB' },
] as const;

/**
 * Search suggestion returned from the search API.
 */
export interface SearchSuggestion {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category: string;
}


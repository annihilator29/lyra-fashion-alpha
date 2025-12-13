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

/**
 * Product with populated variants for PDP.
 */
export interface ProductWithVariants {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    images: string[];
    category: string;
    craftsmanship_content: CraftsmanshipContent | null;
    transparency_data: unknown | null;
    created_at: string;
    updated_at: string;
    product_variants: ProductVariantRow[];
}

/**
 * Product variant row from database.
 */
export interface ProductVariantRow {
    id: string;
    product_id: string;
    sku: string;
    size: string;
    color: string;
    color_hex: string | null;
    price_modifier: number;
    image_url: string | null;
    stock_quantity: number;
    created_at: string;
    updated_at: string;
}

/**
 * Craftsmanship content structure for product details.
 * Updated for Story 2-5 with full Materials/Construction/Quality sections.
 */
export interface CraftsmanshipContent {
    materials: {
        fabric: string;
        origin?: string;
        composition?: string;
    };
    construction: string[];
    quality_checks: string[];
    care_instructions?: string[];
    factory_story_link?: string;
}

/**
 * Size guide measurement data.
 */
export interface SizeMeasurement {
    size: string;
    bust: string;
    waist: string;
    hip: string;
    length: string;
}

/**
 * Size guide data by category.
 */
export const SIZE_GUIDE_DATA: Record<string, SizeMeasurement[]> = {
    dresses: [
        { size: 'XS', bust: '32"', waist: '24"', hip: '34"', length: '35"' },
        { size: 'S', bust: '34"', waist: '26"', hip: '36"', length: '36"' },
        { size: 'M', bust: '36"', waist: '28"', hip: '38"', length: '37"' },
        { size: 'L', bust: '38"', waist: '30"', hip: '40"', length: '38"' },
        { size: 'XL', bust: '40"', waist: '32"', hip: '42"', length: '39"' },
    ],
    tops: [
        { size: 'XS', bust: '32"', waist: '24"', hip: '-', length: '24"' },
        { size: 'S', bust: '34"', waist: '26"', hip: '-', length: '25"' },
        { size: 'M', bust: '36"', waist: '28"', hip: '-', length: '26"' },
        { size: 'L', bust: '38"', waist: '30"', hip: '-', length: '27"' },
        { size: 'XL', bust: '40"', waist: '32"', hip: '-', length: '28"' },
    ],
    bottoms: [
        { size: 'XS', bust: '-', waist: '24"', hip: '34"', length: '40"' },
        { size: 'S', bust: '-', waist: '26"', hip: '36"', length: '41"' },
        { size: 'M', bust: '-', waist: '28"', hip: '38"', length: '42"' },
        { size: 'L', bust: '-', waist: '30"', hip: '40"', length: '43"' },
        { size: 'XL', bust: '-', waist: '32"', hip: '42"', length: '44"' },
    ],
    outerwear: [
        { size: 'XS', bust: '34"', waist: '26"', hip: '36"', length: '28"' },
        { size: 'S', bust: '36"', waist: '28"', hip: '38"', length: '29"' },
        { size: 'M', bust: '38"', waist: '30"', hip: '40"', length: '30"' },
        { size: 'L', bust: '40"', waist: '32"', hip: '42"', length: '31"' },
        { size: 'XL', bust: '42"', waist: '34"', hip: '44"', length: '32"' },
    ],
    accessories: [
        { size: 'One Size', bust: '-', waist: '-', hip: '-', length: '-' },
    ],
};

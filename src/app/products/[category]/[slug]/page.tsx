import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { VALID_CATEGORIES, type ProductCategory, type ProductWithVariants, type CraftsmanshipContent } from '@/types/product';
import { RelatedProducts } from '@/components/shop/related-products';
import { ProductDetailClient } from './product-detail-client';

// ISR: Revalidate every hour
export const revalidate = 3600;

interface PageProps {
    params: Promise<{ category: string; slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category, slug } = await params;

    // Validate category
    if (!VALID_CATEGORIES.includes(category as ProductCategory)) {
        return {
            title: 'Product Not Found | Lyra Fashion',
        };
    }

    const supabase = await createClient();
    const { data: product } = await supabase
        .from('products')
        .select('name, description, price, images, category')
        .eq('slug', slug)
        .eq('category', category)
        .single();

    if (!product) {
        return {
            title: 'Product Not Found | Lyra Fashion',
        };
    }

    const imageUrl = product.images?.[0] || '/placeholder-product.jpg';

    return {
        title: `${product.name} | Lyra Fashion`,
        description: product.description || `Shop ${product.name} - Factory-direct women's fashion with artisan quality and exceptional value.`,
        openGraph: {
            title: `${product.name} | Lyra Fashion`,
            description: product.description || `Shop ${product.name} - Factory-direct women's fashion.`,
            type: 'website',
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 1067,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description || undefined,
            images: [imageUrl],
        },
    };
}

// Fetch product data
async function getProduct(category: string, slug: string): Promise<ProductWithVariants | null> {
    const supabase = await createClient();

    // Try to fetch with variants first
    const { data: product, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('slug', slug)
        .eq('category', category)
        .single();

    // If the query fails (e.g., variants table doesn't exist), try without variants
    if (error) {
        const { data: productOnly, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('slug', slug)
            .eq('category', category)
            .single();

        if (productError || !productOnly) {
            return null;
        }

        return {
            ...productOnly,
            product_variants: [],
        } as unknown as ProductWithVariants;
    }

    if (!product) {
        return null;
    }

    return {
        ...product,
        product_variants: product.product_variants || [],
    } as unknown as ProductWithVariants;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { category, slug } = await params;

    // Validate category
    if (!VALID_CATEGORIES.includes(category as ProductCategory)) {
        notFound();
    }

    // Fetch product with variants
    const product = await getProduct(category, slug);

    if (!product) {
        notFound();
    }

    // Parse craftsmanship content
    const craftsmanship = product.craftsmanship_content as CraftsmanshipContent | null;

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: 'Lyra Fashion',
        },
        category: product.category,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: product.product_variants?.some(v => v.stock_quantity > 0)
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Lyra Fashion',
            },
        },
    };

    return (
        <>
            {/* JSON-LD Script */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main className="relative min-h-screen overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/50 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900" />
                <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-amber-200/10 to-transparent blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6 text-sm" aria-label="Breadcrumb">
                        <ol className="flex items-center gap-2">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-foreground">
                                    Home
                                </Link>
                            </li>
                            <li className="text-muted-foreground">/</li>
                            <li>
                                <Link
                                    href={`/products/${category}`}
                                    className="text-muted-foreground hover:text-foreground capitalize"
                                >
                                    {category}
                                </Link>
                            </li>
                            <li className="text-muted-foreground">/</li>
                            <li className="text-foreground font-medium truncate max-w-[200px]">
                                {product.name}
                            </li>
                        </ol>
                    </nav>

                    {/* Product Detail Grid */}
                    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                        {/* Left Column - Image Gallery */}
                        <ProductDetailClient
                            product={product}
                            craftsmanship={craftsmanship}
                        />
                    </div>

                    {/* Related Products */}
                    <div className="mt-16 border-t pt-16">
                        <RelatedProducts
                            currentProductId={product.id}
                            category={product.category}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}

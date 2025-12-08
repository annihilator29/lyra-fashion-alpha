import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/product-card';
import { ProductCardSkeleton } from '@/components/shop/product-card-skeleton';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/database.types';

// ISR: Revalidate every hour
export const revalidate = 3600;

// SEO Metadata
export const metadata: Metadata = {
  title: 'Lyra Fashion | Factory-Direct Modern Women\'s Clothing',
  description:
    'Discover thoughtfully crafted women\'s fashion made with artisan quality. Shop our collection of dresses, tops, bottoms, and accessories - all factory-direct for exceptional value.',
  openGraph: {
    title: 'Lyra Fashion | Factory-Direct Modern Women\'s Clothing',
    description:
      'Discover thoughtfully crafted women\'s fashion made with artisan quality.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Lyra Fashion',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lyra Fashion | Factory-Direct Modern Women\'s Clothing',
    description:
      'Discover thoughtfully crafted women\'s fashion made with artisan quality.',
  },
};

// Categories for navigation
const CATEGORIES = [
  { name: 'Dresses', slug: 'dresses', description: 'Elegant and versatile' },
  { name: 'Tops', slug: 'tops', description: 'Everyday essentials' },
  { name: 'Bottoms', slug: 'bottoms', description: 'Perfect fits' },
  { name: 'Outerwear', slug: 'outerwear', description: 'Layered style' },
  { name: 'Accessories', slug: 'accessories', description: 'Finishing touches' },
];

// JSON-LD Structured Data
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lyra Fashion',
    description:
      'Factory-direct women\'s fashion with artisan quality and craftsmanship.',
    url: 'https://lyra-fashion.com',
    logo: 'https://lyra-fashion.com/logo.png',
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Fetch featured products from Supabase
async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, images, category, craftsmanship_content, transparency_data, created_at, updated_at')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return products || [];
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-background to-accent px-4 py-24 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_1px)] bg-[length:32px_32px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Tagline */}
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Factory-Direct Fashion
        </p>

        {/* Main Heading */}
        <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Thoughtfully Crafted,
          <br />
          <span className="text-primary">Artisan Quality</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Discover women&apos;s fashion that bridges the gap between factory and wardrobe.
          Every piece tells a story of craftsmanship, transparency, and exceptional value.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-[200px]">
            <Link href="/products">Shop Collection</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[200px]">
            <Link href="/about">Our Story</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Featured Products Section
async function FeaturedProductsSection() {
  const products = await getFeaturedProducts();

  if (products.length === 0) {
    return (
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
            Featured Collection
          </h2>
          <p className="text-muted-foreground">
            New arrivals coming soon. Check back for our latest pieces.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Featured Collection
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Handpicked favorites showcasing our commitment to quality and style
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4} // Priority for first 4 images (above the fold)
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Loading fallback for featured products
function FeaturedProductsLoading() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-6 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Category Navigation Section
function CategoryNavigation() {
  return (
    <section className="bg-secondary/50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Explore our curated collections designed for every occasion
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              className="group flex flex-col items-center justify-center rounded-lg bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Category Icon Placeholder */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <span className="text-2xl">👗</span>
              </div>

              {/* Category Name */}
              <h3 className="mb-1 font-semibold text-foreground">
                {category.name}
              </h3>

              {/* Category Description */}
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Value Proposition Section
function ValueProposition() {
  const values = [
    {
      title: 'Factory Direct',
      description: 'No middlemen, exceptional value',
      icon: '🏭',
    },
    {
      title: 'Artisan Quality',
      description: 'Crafted with care and precision',
      icon: '✨',
    },
    {
      title: 'Transparent Sourcing',
      description: 'Know where your clothes come from',
      icon: '🌿',
    },
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-3xl">
                {value.icon}
              </div>
              <h3 className="mb-2 font-semibold text-foreground">
                {value.title}
              </h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Homepage Component
export default function HomePage() {
  return (
    <>
      <JsonLd />
      <main className="min-h-screen">
        <HeroSection />
        <ValueProposition />
        <Suspense fallback={<FeaturedProductsLoading />}>
          <FeaturedProductsSection />
        </Suspense>
        <CategoryNavigation />
      </main>
    </>
  );
}

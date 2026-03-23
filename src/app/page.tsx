import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, ShieldCheck, Scissors } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LYRA - Artisan Quality',
  description:
    'Curating a world of thoughtful design and enduring quality for the modern wardrobe.',
};

const SUPABASE_URL = 'https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public';

// Hero Section
function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center">
      <div className="absolute inset-0 h-full w-full">
        <Image
          src={`${SUPABASE_URL}/lyra-assets/images/home-hero.jpg`}
          alt="Artisan wearing thoughtful clothing"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h1 className="mb-8 font-serif text-5xl leading-tight text-white md:text-7xl">
          <span className="font-normal italic">Thoughtfully Crafted,</span>
          <br />
          <span className="font-bold">Artisan Quality</span>
        </h1>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/products"
            className="w-64 border border-white px-8 py-3 font-serif text-sm italic text-white transition-colors hover:bg-white hover:text-black sm:w-auto"
          >
            Shop Collection
          </Link>
          <Link
            href="/about"
            className="w-64 border border-white px-8 py-3 font-serif text-sm italic text-white transition-colors hover:bg-white hover:text-black sm:w-auto"
          >
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}

// Product data
const NEW_ARRIVALS = [
  {
    name: 'Silk Blend Midi Dress',
    color: 'Oatmeal / Natural',
    price: '$345.00',
    image: `${SUPABASE_URL}/products/product-silk-dress.jpg`,
    slug: 'silk-blend-midi-dress',
    category: 'dresses',
  },
  {
    name: 'Structured Wool Blazer',
    color: 'Checkered',
    price: '$480.00',
    image: `${SUPABASE_URL}/products/product-wool-blazer.jpg`,
    slug: 'structured-wool-blazer',
    category: 'outerwear',
  },
  {
    name: 'Pleated Linen Trousers',
    color: 'Sand',
    price: '$210.00',
    image: `${SUPABASE_URL}/products/product-linen-trousers.jpg`,
    slug: 'pleated-linen-trousers',
    category: 'bottoms',
  },
  {
    name: 'Soft Grain Leather Tote',
    color: 'Mahogany',
    price: '$590.00',
    image: `${SUPABASE_URL}/products/product-leather-tote.jpg`,
    slug: 'soft-grain-leather-tote',
    category: 'accessories',
  },
];

// New Arrivals Section
function NewArrivalsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between border-b border-gray-200 pb-4">
        <div>
          <p className="mb-1 text-xs tracking-widest uppercase text-gray-400">The Latest</p>
          <h2 className="font-serif text-3xl">New Arrivals</h2>
        </div>
        <Link
          href="/products"
          className="border-b border-gray-500 pb-1 text-xs tracking-widest uppercase text-gray-500 transition-colors hover:border-black hover:text-black"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {NEW_ARRIVALS.map((product) => (
          <Link key={product.name} href={`/products/${product.category}/${product.slug}`} className="group">
            <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-transparent">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mb-1 font-serif text-lg font-normal">{product.name}</h3>
            <p className="mb-2 text-[10px] font-light text-[#888]">{product.color}</p>
            <p className="font-serif text-lg italic">{product.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Featured Collections Section
function FeaturedCollectionsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* The Linen Edit */}
        <div className="group relative h-[600px] cursor-pointer overflow-hidden">
          <Image
            src={`${SUPABASE_URL}/lyra-assets/images/collection-linen-edit.jpg`}
            alt="The Linen Edit"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/30" />
          <div className="absolute bottom-10 left-10 text-left text-white">
            <p className="mb-2 text-xs tracking-widest uppercase">Curated Series</p>
            <h3 className="mb-6 font-serif text-4xl font-bold">The Linen Edit</h3>
            <Link
              href="/products"
              className="border-b border-white pb-1 text-xs tracking-widest uppercase transition-colors hover:border-gray-200 hover:text-gray-200"
            >
              Shop The Collection
            </Link>
          </div>
        </div>

        {/* The Silk Collection */}
        <div className="group relative h-[600px] cursor-pointer overflow-hidden">
          <Image
            src={`${SUPABASE_URL}/lyra-assets/images/collection-silk-collection.jpg`}
            alt="The Silk Collection"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/30" />
          <div className="absolute bottom-10 left-10 text-left text-white">
            <p className="mb-2 text-xs tracking-widest uppercase">Limited Edition</p>
            <h3 className="mb-6 font-serif text-4xl font-bold">The Silk Collection</h3>
            <Link
              href="/products"
              className="border-b border-white pb-1 text-xs tracking-widest uppercase transition-colors hover:border-gray-200 hover:text-gray-200"
            >
              Explore The Styles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Value Propositions Section
function ValuePropositionsSection() {
  return (
    <section className="mt-12 bg-[#f8f7f5] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-20 text-center md:grid-cols-3">
          <div>
            <div className="mb-6 flex justify-center text-gray-700">
              <Leaf className="h-6 w-6" />
            </div>
            <h4 className="mb-4 font-serif text-xl font-normal italic">Sustainability</h4>
            <p className="px-4 text-sm leading-relaxed text-gray-500">
              Every piece is crafted with the planet in mind, utilizing ethically sourced materials
              and zero-waste patterns.
            </p>
          </div>
          <div>
            <div className="mb-6 flex justify-center text-gray-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="mb-4 font-serif text-xl font-normal italic">Quality</h4>
            <p className="px-4 text-sm leading-relaxed text-gray-500">
              We believe in slow fashion. Our garments are designed to last decades, not seasons,
              with reinforced construction.
            </p>
          </div>
          <div>
            <div className="mb-6 flex justify-center text-gray-700">
              <Scissors className="h-6 w-6" />
            </div>
            <h4 className="mb-4 font-serif text-xl font-normal italic">Artisan Craft</h4>
            <p className="px-4 text-sm leading-relaxed text-gray-500">
              Partnering with local craftspeople to preserve heritage techniques and ensure fair
              living wages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Newsletter Section
function NewsletterSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center">
      <p className="mb-4 text-xs tracking-widest uppercase text-gray-400">Join Our Community</p>
      <h2 className="mb-8 font-serif text-4xl italic text-gray-800 md:text-5xl">
        Keep in touch with the atelier
      </h2>
      <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="Enter your email"
          required
          className="flex-1 border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-black"
        />
        <button
          type="submit"
          className="bg-black px-8 py-3 text-sm tracking-widest uppercase text-white transition-colors hover:bg-gray-800"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}

// Main Homepage Component
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8f7f5]">
      <HeroSection />
      <NewArrivalsSection />
      <FeaturedCollectionsSection />
      <ValuePropositionsSection />
      <NewsletterSection />
    </main>
  );
}

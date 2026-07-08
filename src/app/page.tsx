import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Fraunces, Inter } from 'next/font/google';
import { Leaf, ShieldCheck, Scissors, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LYRA — Thoughtfully Crafted, Artisan Quality',
  description:
    'Curating a world of thoughtful design and enduring quality for the modern wardrobe. Slow fashion, made to last decades — not seasons.',
};

// Landing-scoped display face. Fraunces: a warm optical "old-style" serif that
// suits the artisan / slow-fashion narrative better than the colder Playfair.
// Loaded here only — the rest of the site keeps its existing typography until
// this redesign is approved site-wide.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
});

const SUPABASE_URL = 'https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public';

// ——— Hero ———
function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={`${SUPABASE_URL}/lyra-assets/images/home-hero.jpg`}
          alt="Artisan wearing thoughtfully crafted clothing"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/45" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <p className="lyra-fade mb-8 text-[11px] font-light uppercase tracking-[0.4em] text-white/70">
          Slow Fashion · Made to Last
        </p>
        <h1 className="lyra-reveal font-serif text-5xl leading-[1.05] text-white sm:text-7xl md:text-8xl">
          <span className="block font-light italic">Thoughtfully</span>
          <span className="block font-medium">Crafted</span>
        </h1>
        <p className="lyra-reveal-2 mx-auto mt-8 max-w-md text-sm font-light leading-relaxed text-white/80">
          Enduring quality for the modern wardrobe — garments designed to live
          decades, not seasons.
        </p>
        <div className="lyra-reveal-3 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 border border-white/70 px-10 py-4 text-[11px] font-medium uppercase tracking-[0.25em] text-white transition-all duration-500 hover:bg-white hover:text-black"
          >
            Shop the Collection
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center px-10 py-4 text-[11px] font-medium uppercase tracking-[0.25em] text-white/80 transition-colors duration-500 hover:text-white"
          >
            Our Story
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-light uppercase tracking-[0.3em] text-white/50">
        Scroll
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

// ——— New Arrivals ———
function NewArrivalsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28 sm:px-8 lg:px-12">
      <div className="mb-16 flex flex-col items-baseline justify-between border-b border-neutral-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-light uppercase tracking-[0.3em] text-neutral-400">
            The Latest
          </p>
          <h2 className="font-serif text-4xl font-normal text-neutral-900 md:text-5xl">
            New Arrivals
          </h2>
        </div>
        <Link
          href="/products"
          className="group mt-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-neutral-500 transition-colors duration-300 hover:text-neutral-900 sm:mt-0"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
        {NEW_ARRIVALS.map((product) => (
          <Link
            key={product.name}
            href={`/products/${product.category}/${product.slug}`}
            className="group block"
          >
            <div className="relative mb-5 aspect-[3/4] overflow-hidden bg-neutral-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <h3 className="font-serif text-lg font-normal text-neutral-900">
              {product.name}
            </h3>
            <p className="mt-1 text-[11px] font-light uppercase tracking-wide text-neutral-400">
              {product.color}
            </p>
            <p className="mt-2 font-serif text-base italic text-neutral-700">
              {product.price}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ——— Featured Collections ———
function FeaturedCollectionsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="group relative h-[70vh] min-h-[460px] overflow-hidden">
          <Image
            src={`${SUPABASE_URL}/lyra-assets/images/collection-linen-edit.jpg`}
            alt="The Linen Edit"
            fill
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/15 transition-colors duration-700 group-hover:bg-black/25" />
          <div className="absolute bottom-10 left-10 text-white">
            <p className="mb-3 text-[11px] font-light uppercase tracking-[0.3em] text-white/80">
              Curated Series
            </p>
            <h3 className="mb-6 font-serif text-4xl font-medium md:text-5xl">
              The Linen Edit
            </h3>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border-b border-white/70 pb-1 text-[11px] font-medium uppercase tracking-[0.25em] transition-colors duration-300 hover:border-white"
            >
              Shop the Collection
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="group relative h-[70vh] min-h-[460px] overflow-hidden">
          <Image
            src={`${SUPABASE_URL}/lyra-assets/images/collection-silk-collection.jpg`}
            alt="The Silk Collection"
            fill
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/15 transition-colors duration-700 group-hover:bg-black/25" />
          <div className="absolute bottom-10 left-10 text-white">
            <p className="mb-3 text-[11px] font-light uppercase tracking-[0.3em] text-white/80">
              Limited Edition
            </p>
            <h3 className="mb-6 font-serif text-4xl font-medium md:text-5xl">
              The Silk Collection
            </h3>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border-b border-white/70 pb-1 text-[11px] font-medium uppercase tracking-[0.25em] transition-colors duration-300 hover:border-white"
            >
              Explore the Styles
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— Value Propositions ———
const VALUES = [
  {
    icon: Leaf,
    title: 'Sustainability',
    body: 'Every piece is crafted with the planet in mind, utilizing ethically sourced materials and zero-waste patterns.',
  },
  {
    icon: ShieldCheck,
    title: 'Enduring Quality',
    body: 'We believe in slow fashion. Our garments are designed to last decades, not seasons, with reinforced construction.',
  },
  {
    icon: Scissors,
    title: 'Artisan Craft',
    body: 'Partnering with local craftspeople to preserve heritage techniques and ensure fair living wages.',
  },
];

function ValuePropositionsSection() {
  return (
    <section className="bg-neutral-50 py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-[11px] font-light uppercase tracking-[0.3em] text-neutral-400">
            What We Stand For
          </p>
          <h2 className="font-serif text-4xl font-normal text-neutral-900 md:text-5xl">
            Considered in every detail
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-14 text-center md:grid-cols-3 md:gap-10">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="px-2">
              <div className="mb-6 flex justify-center text-neutral-800">
                <Icon className="h-6 w-6" strokeWidth={1.25} />
              </div>
              <h4 className="mb-4 font-serif text-2xl font-normal italic text-neutral-900">
                {title}
              </h4>
              <p className="mx-auto max-w-xs text-sm font-light leading-relaxed text-neutral-500">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— Newsletter ———
function NewsletterSection() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="mb-4 text-[11px] font-light uppercase tracking-[0.3em] text-neutral-400">
        Join the Atelier
      </p>
      <h2 className="mb-4 font-serif text-4xl font-normal italic text-neutral-900 md:text-5xl">
        Keep in touch
      </h2>
      <p className="mb-10 text-sm font-light leading-relaxed text-neutral-500">
        Notes on new arrivals, restocks, and the craft behind each piece.
      </p>
      <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="Enter your email"
          required
          className="flex-1 border border-neutral-300 bg-transparent px-4 py-3.5 text-sm font-light outline-none transition-colors duration-300 placeholder:text-neutral-400 focus:border-neutral-900"
        />
        <button
          type="submit"
          className="bg-neutral-900 px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-neutral-700"
        >
          Subscribe
        </button>
      </form>
    </section>
  );
}

// ——— Page ———
export default function HomePage() {
  return (
    <main
      className={`${inter.variable} ${fraunces.variable} min-h-screen bg-white font-sans text-neutral-900 antialiased`}
    >
      <HeroSection />
      <NewArrivalsSection />
      <FeaturedCollectionsSection />
      <ValuePropositionsSection />
      <NewsletterSection />
    </main>
  );
}

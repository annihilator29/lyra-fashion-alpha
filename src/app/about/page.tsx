import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/layout/hero-section';
import { FactoryTimeline } from '@/components/transparency/factory-timeline';
import { PhotoGallery } from '@/components/transparency/photo-gallery';
import { CredentialsSection } from '@/components/transparency/credentials-section';
import { ValuePropositionSection } from '@/components/transparency/value-proposition-section';

export const metadata: Metadata = {
  title: 'About Lyra Fashion - Factory-Direct Quality',
  description:
    'Learn about Lyra\'s factory-direct model, craftsmanship process, and the artisans behind your clothing.',
  openGraph: {
    title: 'About Lyra Fashion',
    description: 'Factory-direct quality, authentic craftsmanship',
    images: ['/images/og-factory-story.jpg'],
  },
  other: {
    'og:type': 'website',
    'og:site_name': 'Lyra Fashion',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-8 text-center text-[#3A3531]">
          Factory-Direct Quality
        </h1>
      </section>

      <HeroSection
        title="Factory-Direct Quality, Every Time"
        subtitle="Experience authentic craftsmanship, transparent production, and fair pricing"
        image="/images/factory-hero.jpg"
        cta={{
          text: 'Explore Our Process',
          link: '#timeline',
        }}
      />

      <section id="timeline" className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-8 text-center text-[#3A3531]">
          Our Production Process
        </h2>
        <FactoryTimeline />
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-8 text-center text-[#3A3531]">
          Behind the Seams
        </h2>
        <PhotoGallery
          images={[
            {
              src: '/images/factory-1.jpg',
              alt: 'Design process at Lyra Fashion factory',
            },
            {
              src: '/images/factory-2.jpg',
              alt: 'Cutting fabric for production',
            },
            {
              src: '/images/factory-3.jpg',
              alt: 'Skilled artisans at work',
            },
            {
              src: '/images/factory-4.jpg',
              alt: 'Sewing and assembly',
            },
            {
              src: '/images/factory-5.jpg',
              alt: 'Quality control inspection',
            },
            {
              src: '/images/factory-6.jpg',
              alt: 'Finished products ready for shipping',
            },
          ]}
        />
      </section>

      <CredentialsSection />

      <ValuePropositionSection />

      <section className="container mx-auto px-4 py-12 md:py-20 bg-[#F5F3F0]">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-12 text-center text-[#3A3531]">
          Ready to Explore?
        </h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/products">
            <Button
              size="lg"
              className="bg-[#4A5F4B] hover:bg-[#7A9B7C] text-white px-8 py-6 text-lg"
            >
              Shop Products
            </Button>
          </Link>
          <Link href="/blog">
            <Button
              variant="outline"
              size="lg"
              className="border-[#4A5F4B] text-[#4A5F4B] hover:bg-[#F5F3F0] px-8 py-6 text-lg"
            >
              Learn More About Our Process
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

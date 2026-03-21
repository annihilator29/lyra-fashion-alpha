import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Factory Story - Lyra Fashion',
  description:
    'Discover the story behind Lyra Fashion — from raw materials to finished garments, crafted with care in our own factory.',
};

export default function FactoryStoryPage() {
  return (
    <main className="min-h-screen">
      <section className="bg-slate-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Factory Story</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            From raw materials to your wardrobe — every stitch tells a story of craftsmanship and care.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Factory-Direct Model</h2>
            <p className="text-[#3A3531]/80 leading-relaxed">
              Unlike traditional fashion brands that outsource production, Lyra Fashion owns and operates its
              manufacturing facilities. This means complete control over quality, working conditions, and
              environmental impact — and savings passed directly to you.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Skilled Artisans</h2>
            <p className="text-[#3A3531]/80 leading-relaxed">
              Our team of experienced tailors, cutters, and quality specialists bring decades of expertise to
              every garment. We invest in fair wages, safe working conditions, and continuous training because
              great clothes come from people who love what they do.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Quality at Every Step</h2>
            <p className="text-[#3A3531]/80 leading-relaxed">
              From fabric sourcing to final inspection, every garment goes through rigorous quality checks.
              We use premium natural fibers, reinforced stitching, and careful finishing to ensure your
              clothes last for years, not seasons.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-[#3A3531]">Sustainable Practices</h2>
            <p className="text-[#3A3531]/80 leading-relaxed">
              We minimize waste through precision cutting, use eco-friendly dyes, and package responsibly.
              Our factory runs on energy-efficient systems, and we continuously seek ways to reduce our
              environmental footprint without compromising quality.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

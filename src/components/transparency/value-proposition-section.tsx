import { ValueProposition } from '@/types/factory-story';

interface ValuePropositionSectionProps {
  proposition?: ValueProposition;
}

const DEFAULT_PROPOSITION: ValueProposition = {
  title: 'Why Factory-Direct?',
  description:
    'Experience the benefits of buying directly from the source',
  benefits: [
    {
      title: 'Better Pricing',
      description:
        'Save 30-50% compared to traditional retail by eliminating middleman markups',
    },
    {
      title: 'Quality Assurance',
      description:
        'Direct oversight of production ensures every piece meets our exacting standards',
    },
    {
      title: 'Transparent Process',
      description:
        'See exactly how your garments are made from design to delivery',
    },
    {
      title: 'Artisan Connection',
      description:
        'Support skilled craftspeople with fair wages and sustainable practices',
    },
  ],
};

export function ValuePropositionSection({
  proposition = DEFAULT_PROPOSITION,
}: ValuePropositionSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20 bg-[#F5F3F0]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-8 text-[#3A3531]">
          {proposition.title}
        </h2>
        <p className="text-xl text-center text-[#3A3531]/80 mb-12 max-w-2xl mx-auto">
          {proposition.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {proposition.benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <h3 className="text-2xl font-semibold text-[#3A3531] mb-4">
                {benefit.title}
              </h3>
              <p className="text-[#3A3531]/80 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

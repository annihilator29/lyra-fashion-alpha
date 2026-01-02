import { Credential } from '@/types/factory-story';

interface CredentialsSectionProps {
  credentials?: Credential[];
}

const DEFAULT_CREDENTIALS: Credential[] = [
  {
    type: 'certification',
    title: 'ISO 9001:2015 Certified',
    description: 'Our quality management system meets international standards for consistent, reliable production.',
  },
  {
    type: 'certification',
    title: 'OEKO-TEX Standard 100',
    description: 'All fabrics are tested for harmful substances and certified safe for direct skin contact.',
  },
  {
    type: 'standard',
    title: 'Fair Trade Practices',
    description: 'We ensure fair wages, safe working conditions, and ethical labor practices throughout our supply chain.',
  },
  {
    type: 'practice',
    title: 'Sustainable Materials',
    description: 'Prioritizing organic, recycled, and eco-friendly fabrics to minimize environmental impact.',
  },
  {
    type: 'practice',
    title: 'Waste Reduction',
    description: 'Implementing zero-waste cutting techniques and recycling fabric scraps.',
  },
];

export function CredentialsSection({
  credentials = DEFAULT_CREDENTIALS,
}: CredentialsSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <h2 className="text-3xl md:text-4xl font-playfair font-bold text-center mb-12 text-[#3A3531]">
        Our Commitments
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map((credential, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="mb-4">
              {credential.type === 'certification' && (
                <span className="inline-flex items-center justify-center w-12 h-12 bg-[#4A5F4B] text-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              )}
              {credential.type === 'standard' && (
                <span className="inline-flex items-center justify-center w-12 h-12 bg-[#C87E6C] text-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
              {credential.type === 'practice' && (
                <span className="inline-flex items-center justify-center w-12 h-12 bg-[#A8B5A1] text-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-[#3A3531] mb-2">
              {credential.title}
            </h3>
            <p className="text-[#3A3531]/80 leading-relaxed">
              {credential.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

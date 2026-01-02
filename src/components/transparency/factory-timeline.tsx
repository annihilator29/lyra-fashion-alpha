import { TimelineStage } from '@/types/factory-story';

interface FactoryTimelineProps {
  stages?: TimelineStage[];
}

const DEFAULT_STAGES: TimelineStage[] = [
  {
    stage: 'Design',
    description: 'Initial design and pattern creation with meticulous attention to detail',
  },
  {
    stage: 'Fabric Selection',
    description: 'Hand-picking premium fabrics from trusted sustainable suppliers',
  },
  {
    stage: 'Cutting',
    description: 'Precision cutting of fabric pieces to minimize waste',
  },
  {
    stage: 'Sewing',
    description: 'Expert assembly by skilled artisans with decades of experience',
  },
  {
    stage: 'Quality Control',
    description: 'Rigorous inspection to ensure every piece meets our standards',
  },
];

export function FactoryTimeline({ stages = DEFAULT_STAGES }: FactoryTimelineProps) {
  return (
    <div data-testid="timeline" className="space-y-8">
      <div className="relative">
        {/* Vertical line for mobile */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#4A5F4B] hidden md:block md:left-1/2 md:-ml-px" />

        {stages.map((stage, index) => (
          <div
            key={stage.stage}
            className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* Timeline dot */}
            <div className="hidden md:flex absolute left-1/2 -ml-2 w-4 h-4 bg-[#4A5F4B] rounded-full items-center justify-center border-4 border-[#F5F3F0] z-10" />

            {/* Mobile dot */}
            <div className="md:hidden flex absolute left-4 w-4 h-4 bg-[#4A5F4B] rounded-full items-center justify-center border-4 border-[#F5F3F0] z-10" />

            {/* Content */}
            <div
              className={`flex-1 space-y-2 ${
                index % 2 === 0 ? 'md:text-left' : 'md:text-right'
              }`}
            >
              <div
                className={`md:hidden pl-12 ${
                  index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                }`}
              >
                <h3 className="text-2xl font-playfair font-bold text-[#3A3531] mb-2">
                  {stage.stage}
                </h3>
                <p className="text-[#3A3531]/80 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:block">
                <div
                  className={`${
                    index % 2 === 0 ? 'pr-12 text-left' : 'pl-12 text-right'
                  }`}
                >
                  <h3 className="text-2xl font-playfair font-bold text-[#3A3531] mb-2">
                    {stage.stage}
                  </h3>
                  <p className="text-[#3A3531]/80 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div data-testid="timeline" className="relative space-y-8 py-10">
        
      {/* Central Timeline Track - Faint but visible */}
      <div className="absolute left-6 top-0 bottom-0 w-1 bg-neutral-200 hidden md:block md:left-1/2 md:-ml-0.5" />
      
      {/* Mobile Track */}
      <div className="absolute left-6 top-0 bottom-0 w-1 bg-neutral-200 md:hidden" />

      {stages.map((stage, index) => (
        <div
          key={stage.stage}
          className={`relative flex items-center gap-8 ${
            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
          }`}
        >
          {/* Timeline Dot - with pulse effect */}
          <div className="absolute left-6 -ml-3 z-10 md:left-1/2 md:-ml-3">
             <div className="w-6 h-6 bg-[#4A5F4B] rounded-full border-4 border-[#F5F3F0] shadow-sm relative">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#4A5F4B]"></div>
             </div>
          </div>

          {/* Content Card */}
          <div className={`flex-1 ml-16 md:ml-0 ${
             index % 2 === 0 ? 'md:mr-[50%] md:pr-12' : 'md:ml-[50%] md:pl-12'
          }`}>
            <div className={`
                relative bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] 
                hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1
                border border-neutral-100 group
            `}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-serif font-bold text-[#3A3531] group-hover:text-[#4A5F4B] transition-colors">
                        {stage.stage}
                    </h3>
                    <span className="text-4xl font-serif text-neutral-200 font-bold select-none absolute right-6 top-4 group-hover:text-neutral-300 transition-colors">
                        0{index + 1}
                    </span>
                </div>
                <p className="text-[#3A3531]/80 leading-relaxed relative z-10">
                    {stage.description}
                </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

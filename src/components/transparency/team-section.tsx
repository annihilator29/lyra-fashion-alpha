import Image from 'next/image';
import { TeamMember } from '@/types/factory-story';
import { getStorageImageUrl } from '@/lib/utils/image';

interface TeamSectionProps {
  members?: TeamMember[];
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    name: 'Priya Sharma',
    role: 'Head Artisan',
    bio: 'With 15 years of experience in traditional textile craftsmanship, Priya leads our artisan team with precision and dedication to quality.',
    photo: getStorageImageUrl('team-1.png'),
  },
  {
    name: 'Rajesh Kumar',
    role: 'Quality Assurance Lead',
    bio: 'Rajesh ensures every piece meets our exacting standards, overseeing the entire quality control process from start to finish.',
    photo: getStorageImageUrl('team-2.png'),
  },
  {
    name: 'Anita Desai',
    role: 'Design Director',
    bio: 'Anita brings innovative design concepts to life, blending modern aesthetics with traditional craftsmanship techniques.',
    photo: getStorageImageUrl('team-3.png'),
  },
  {
    name: 'Vikram Patel',
    role: 'Production Manager',
    bio: 'Vikram coordinates our entire production workflow, ensuring efficiency and maintaining our commitment to ethical manufacturing.',
    photo: getStorageImageUrl('team-4.png'),
  },
];

export function TeamSection({ members = DEFAULT_MEMBERS }: TeamSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center text-[#3A3531]">
        Meet Our Artisans
      </h2>
      <p className="text-xl text-center text-[#3A3531]/80 mb-12 max-w-3xl mx-auto">
        The skilled craftspeople behind every garment we create
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.map((member, index) => (
          <div
            key={index}
            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 group"
          >
            <div className="aspect-square bg-[#F5F3F0] flex items-center justify-center overflow-hidden relative">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-[#7A9B7C]/20 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-[#4A5F4B]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#3A3531] mb-2">
                {member.name}
              </h3>
              <p className="text-[#4A5F4B] font-medium mb-3 text-sm">
                {member.role}
              </p>
              {member.bio && (
                <p className="text-[#3A3531]/80 leading-relaxed text-sm">
                  {member.bio}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

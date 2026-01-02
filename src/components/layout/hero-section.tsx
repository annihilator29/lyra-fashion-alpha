import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  image: string;
  cta: {
    text: string;
    link: string;
  };
}

export function HeroSection({ title, subtitle, image, cta }: HeroSectionProps) {
  return (
    <section className="relative py-20 md:py-32 bg-[#F5F3F0]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#3A3531]">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-[#3A3531]/80 max-w-2xl">
              {subtitle}
            </p>
            <Link href={cta.link}>
              <Button
                size="lg"
                className="bg-[#4A5F4B] hover:bg-[#7A9B7C] text-white px-8 py-6 text-lg"
              >
                {cta.text}
              </Button>
            </Link>
          </div>
          <div className="flex-1 relative h-[400px] md:h-[500px] w-full">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover rounded-lg shadow-xl"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

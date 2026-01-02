/**
 * Factory Story & About Page Type Definitions
 * Defines data structure for content management and future admin interface
 */

export interface HeroSection {
  title: string;
  subtitle: string;
  image: string;
  cta: {
    text: string;
    link: string;
  };
}

export interface TimelineStage {
  stage: string;
  description: string;
  image?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
}

export type CredentialType = 'certification' | 'standard' | 'practice';

export interface Credential {
  type: CredentialType;
  title: string;
  description: string;
  icon?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface ValueProposition {
  title: string;
  description: string;
  benefits: Benefit[];
}

export interface FactoryStoryContent {
  hero: HeroSection;
  timeline: TimelineStage[];
  team: TeamMember[];
  credentials: Credential[];
  gallery: GalleryImage[];
  valueProposition: ValueProposition;
  ctas: {
    primary: {
      text: string;
      link: string;
    };
    secondary: {
      text: string;
      link: string;
    };
  };
}

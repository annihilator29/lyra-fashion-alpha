/**
 * Craftsmanship TypeScript Types
 * 
 * Type definitions for craftsmanship content data structures.
 * These types ensure type safety across components and server actions.
 * 
 * @module lib/craftsmanship/types
 */

/**
 * Manufacturer/organization information
 * Supports schema.org Organization compliance
 */
export interface Manufacturer {
  name: string;
  logo?: string;
  url?: string;
}

/**
 * Materials section data
 * Captures fabric details, origin, weight, and certifications
 */
export interface Materials {
  fabric: string;
  origin: string;
  weight?: string;
  certifications?: string[];
}

/**
 * Construction techniques data
 * Captures stitching, finishing, and quality standards
 */
export interface Construction {
  stitching: string[];
  finishing: string[];
  quality_checks?: string[];
}

/**
 * Complete craftsmanship content structure
 * Combines materials, construction, and quality information
 * Includes schema.org ManufacturingProcess compliance fields
 */
export interface CraftsmanshipContent {
  materials: Materials;
  construction: Construction;
  quality_checks: string[];
  factory_story_link?: string;
  care_instructions?: string;
  // schema.org ManufacturingProcess required fields
  productionDate?: string;
  manufacturer?: Manufacturer;
  sku?: string;
  model?: string;
}

/**
 * Partial craftsmanship content for incremental updates
 * All fields are optional to support partial saves
 */
export type PartialCraftsmanshipContent = Partial<CraftsmanshipContent>;

/**
 * Template content that can be merged with base content
 */
export interface TemplateContent {
  care_instructions?: string;
  quality_checks?: readonly string[];
  materials?: Partial<Materials>;
  construction?: Partial<Construction>;
}

/**
 * Reusable craftsmanship template definition
 */
export interface CraftsmanshipTemplate {
  id: string;
  name: string;
  description: string;
  content: TemplateContent;
}

/**
 * Props for the main craftsmanship section component
 */
export interface CraftsmanshipSectionProps {
  craftsmanship: CraftsmanshipContent | null;
  productName?: string;
}

/**
 * Props for materials section component
 */
export interface MaterialsSectionProps {
  data: Materials;
}

/**
 * Props for construction section component
 */
export interface ConstructionSectionProps {
  data: Construction;
}

/**
 * Props for quality section component
 */
export interface QualitySectionProps {
  checks: string[];
}

/**
 * Props for the admin craftsmanship editor form
 */
export interface CraftsmanshipEditorFormProps {
  productId: string;
  initialData?: CraftsmanshipContent | null;
  onSave?: (data: CraftsmanshipContent) => Promise<void>;
}

/**
 * Server action result types for save operations
 */
export interface SaveCraftsmanshipSuccess {
  success: true;
  revalidatedPaths: string[];
  product: CraftsmanshipContent;
}

export interface SaveCraftsmanshipError {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'PERMISSION_DENIED' | 'UNKNOWN_ERROR';
    message?: string;
    details?: unknown;
  };
}

export type SaveCraftsmanshipResult = SaveCraftsmanshipSuccess | SaveCraftsmanshipError;

/**
 * JSON-LD structured data types for SEO
 */
export interface JSONLDManufacturingProcess {
  '@context': 'https://schema.org';
  '@type': 'ManufacturingProcess';
  name: string;
  productionDate?: string;
  manufacturer?: {
    '@type': 'Organization';
    name: string;
    logo?: string;
    url?: string;
  };
  productManufacturingProcess: Array<{
    '@type': 'ManufacturingProcess';
    name: string;
    description: string;
    startDate?: string;
  }>;
}

/**
 * Factory story link data for related content
 */
export interface FactoryStoryLink {
  url: string;
  title: string;
  excerpt?: string;
}

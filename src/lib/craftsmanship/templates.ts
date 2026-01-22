/**
 * Craftsmanship Templates
 * 
 * Provides reusable content templates for common craftsmanship patterns.
 * Templates can be applied to products to reduce content duplication
 * and ensure consistent quality information across the catalog.
 * 
 * @module lib/craftsmanship/templates
 */

import type { CraftsmanshipContent, CraftsmanshipTemplate, TemplateContent } from './types';

/**
 * Pre-defined craftsmanship templates
 * Each template contains content that can be merged with product-specific data
 */
export const CRAFTSMANSHIP_TEMPLATES = {
  /**
   * Cotton care instructions template
   */
  COTTON_CARE: {
    id: 'cotton-care',
    name: 'Cotton Care Instructions',
    description: 'Standard care instructions for cotton garments',
    content: {
      care_instructions: 'Machine wash cold with similar colors. Tumble dry low. Cool iron if needed. Do not bleach. Dry clean recommended for best results.'
    }
  } as const,

  /**
   * Silk care instructions template
   */
  SILK_CARE: {
    id: 'silk-care',
    name: 'Silk Care Instructions',
    description: 'Care instructions for silk garments',
    content: {
      care_instructions: 'Dry clean only. Cool iron if needed on reverse side. Do not bleach or tumble dry. Store in breathable bag.'
    }
  } as const,

  /**
   * Wool care instructions template
   */
  WOOL_CARE: {
    id: 'wool-care',
    name: 'Wool Care Instructions',
    description: 'Care instructions for wool garments',
    content: {
      care_instructions: 'Hand wash cold or dry clean. Lay flat to dry. Do not bleach. Steam to remove wrinkles. Store folded to maintain shape.'
    }
  } as const,

  /**
   * Standard quality checks template
   */
  STANDARD_QUALITY: {
    id: 'standard-quality',
    name: 'Standard Quality Checks',
    description: 'Basic quality assurance process',
    content: {
      quality_checks: [
        'Pre-production fabric inspection',
        'In-production stitch verification',
        'Post-production quality control'
      ]
    }
  } as const,

  /**
   * Premium quality checks template
   */
  PREMIUM_QUALITY: {
    id: 'premium-quality',
    name: 'Premium Quality Checks',
    description: 'Enhanced quality assurance for premium products',
    content: {
      quality_checks: [
        'Pre-production fabric inspection with magnification',
        'In-production stitch verification at every stage',
        'Hand-finishing quality control',
        'Final inspection with detailed documentation',
        'Quality certification by master tailor'
      ]
    }
  } as const,

  /**
   * Organic cotton materials template
   */
  ORGANIC_COTTON: {
    id: 'organic-cotton',
    name: 'Organic Cotton Materials',
    description: 'Standard organic cotton material details',
    content: {
      materials: {
        certifications: ['GOTS Certified', 'Fair Trade']
      }
    }
  } as const,

  /**
   * French seams construction template
   */
  FRENCH_SEAMS: {
    id: 'french-seams',
    name: 'French Seams Construction',
    description: 'Construction using French seams for clean finish',
    content: {
      construction: {
        stitching: ['French seams (1.5cm)', 'Double-stitched stress points'],
        finishing: ['Hand-finished hems', 'French binding on all edges']
      }
    }
  } as const,

  /**
   * Hand-stitched construction template
   */
  HAND_STITCHED: {
    id: 'hand-stitched',
    name: 'Hand-Stitched Construction',
    description: 'Traditional hand-stitched construction techniques',
    content: {
      construction: {
        stitching: ['Hand-stitched buttonholes', 'Hand-sewn details', 'Traditional saddle stitching'],
        finishing: ['Hand-pressed', 'Hand-finished edges']
      }
    }
  } as const,

  /**
   * Sustainable production template
   */
  SUSTAINABLE_PRODUCTION: {
    id: 'sustainable-production',
    name: 'Sustainable Production',
    description: 'Environmentally conscious production methods',
    content: {
      care_instructions: 'Wash in cold water to conserve energy. Air dry when possible. Repair rather than replace to extend garment life.',
      manufacturer: {
        name: 'Sustainably Certified Factory',
        url: 'https://lyrafashion.com/sustainability'
      }
    }
  } as const
} as const;

/**
 * Type-safe template ID union
 */
export type TemplateId = keyof typeof CRAFTSMANSHIP_TEMPLATES;

/**
 * All available template IDs as an array
 */
export const TEMPLATE_IDS = Object.keys(CRAFTSMANSHIP_TEMPLATES) as TemplateId[];

/**
 * Apply a template to base craftsmanship content
 * Template content merges with base, with template values taking precedence
 * Arrays are concatenated to preserve both base and template values
 * 
 * @param baseContent - The base craftsmanship content
 * @param templateId - The template ID to apply
 * @returns Merged craftsmanship content
 */
export function applyTemplate(
  baseContent: CraftsmanshipContent,
  templateId: string
): CraftsmanshipContent {
  // Validate template ID at runtime
  const validTemplateId = templateId as TemplateId;
  
  if (!(validTemplateId in CRAFTSMANSHIP_TEMPLATES)) {
    const availableTemplates = TEMPLATE_IDS.join(', ');
    throw new Error(
      `Template "${templateId}" not found. Available templates: ${availableTemplates}`
    );
  }

  const template = CRAFTSMANSHIP_TEMPLATES[validTemplateId];
  
  // Helper function to merge arrays (concatenate instead of replace)
  const mergeArrays = <T>(base: T[] | undefined | readonly T[], template: T[] | undefined | readonly T[]): T[] => {
    const baseArray = base ? [...base] : [];
    const templateArray = template ? [...template] : [];
    // Remove duplicates and concatenate
    return [...new Set([...baseArray, ...templateArray])];
  };
  
  // Merge template content with base content
  const templateContent = template.content as TemplateContent;
  const templateMaterials = templateContent.materials || {};
  const templateConstruction = templateContent.construction || {};
  
  return {
    ...baseContent,
    ...templateContent,
    // Handle nested objects with array concatenation
    materials: {
      ...baseContent.materials,
      ...templateMaterials,
      certifications: mergeArrays(
        baseContent.materials.certifications,
        templateMaterials.certifications
      )
    },
    construction: {
      ...baseContent.construction,
      ...templateConstruction,
      stitching: mergeArrays(
        baseContent.construction.stitching,
        templateConstruction.stitching
      ),
      finishing: mergeArrays(
        baseContent.construction.finishing,
        templateConstruction.finishing
      ),
      quality_checks: mergeArrays(
        baseContent.construction.quality_checks,
        templateConstruction.quality_checks
      )
    },
    // Concatenate quality_checks at top level
    quality_checks: mergeArrays(
      baseContent.quality_checks,
      templateContent.quality_checks
    )
  };
}

/**
 * Apply multiple templates in sequence
 * Each subsequent template merges with the result of the previous
 * 
 * @param baseContent - The base craftsmanship content
 * @param templateIds - Array of template IDs to apply in order
 * @returns Final merged craftsmanship content
 */
export function applyTemplates(
  baseContent: CraftsmanshipContent,
  templateIds: string[]
): CraftsmanshipContent {
  let result = baseContent;
  
  for (const templateId of templateIds) {
    result = applyTemplate(result, templateId);
  }
  
  return result;
}

/**
 * Get a template by ID
 * 
 * @param templateId - The template ID to retrieve
 * @returns The template object
 */
export function getTemplate(templateId: string): CraftsmanshipTemplate | null {
  const validTemplateId = templateId as TemplateId;
  
  if (!(validTemplateId in CRAFTSMANSHIP_TEMPLATES)) {
    return null;
  }
  
  return CRAFTSMANSHIP_TEMPLATES[validTemplateId] as CraftsmanshipTemplate | null;
}

/**
 * Get all available templates
 * 
 * @returns Array of all template objects
 */
export function getAllTemplates(): CraftsmanshipTemplate[] {
  return TEMPLATE_IDS.map(id => CRAFTSMANSHIP_TEMPLATES[id]) as CraftsmanshipTemplate[];
}

/**
 * Filter templates by category
 * Categories are determined by template ID prefixes
 * 
 * @param category - Category filter (care, quality, materials, construction, production)
 * @returns Filtered array of templates
 */
export function getTemplatesByCategory(
  category: 'care' | 'quality' | 'materials' | 'construction' | 'production'
): CraftsmanshipTemplate[] {
  const categoryPrefixes: Record<string, string[]> = {
    care: ['cotton-care', 'silk-care', 'wool-care'],
    quality: ['standard-quality', 'premium-quality'],
    materials: ['organic-cotton'],
    construction: ['french-seams', 'hand-stitched'],
    production: ['sustainable-production']
  };
  
  const allowedIds = categoryPrefixes[category] || [];
  
  return TEMPLATE_IDS
    .filter(id => allowedIds.includes(CRAFTSMANSHIP_TEMPLATES[id].id))
    .map(id => CRAFTSMANSHIP_TEMPLATES[id]) as CraftsmanshipTemplate[];
}

/**
 * Preview template content without applying it
 * Useful for showing users what a template contains
 * 
 * @param templateId - The template ID to preview
 * @returns Template content preview
 */
export function previewTemplate(templateId: string): TemplateContent | null {
  const template = getTemplate(templateId);
  return template ? template.content : null;
}

/**
 * Craftsmanship Content Validation Schemas
 * 
 * Provides zod schemas for validating craftsmanship content data structure.
 * Used for form validation and API request validation.
 * 
 * @module lib/craftsmanship/validation
 */

import { z } from 'zod';

/**
 * Schema for manufacturer/organization information
 * Supports schema.org Organization compliance
 */
export const ManufacturerSchema = z.object({
  name: z.string().min(1, "Manufacturer name required"),
  logo: z.string().url().optional(),
  url: z.string().url().optional(),
});

export type Manufacturer = z.infer<typeof ManufacturerSchema>;

/**
 * Schema for materials section
 * Captures fabric details, origin, weight, and certifications
 */
export const MaterialsSchema = z.object({
  fabric: z.string().min(1, "Fabric description required"),
  origin: z.string().min(1, "Origin required"),
  weight: z.string().optional(),
  certifications: z.array(z.string()).optional(),
});

export type Materials = z.infer<typeof MaterialsSchema>;

/**
 * Schema for construction techniques
 * Captures stitching, finishing, and quality standards
 */
export const ConstructionSchema = z.object({
  stitching: z.array(z.string()).min(1, "At least one stitching technique required"),
  finishing: z.array(z.string()).min(1, "At least one finishing technique required"),
  quality_checks: z.array(z.string()).optional(),
});

export type Construction = z.infer<typeof ConstructionSchema>;

/**
 * Complete craftsmanship content schema
 * Combines materials, construction, and quality information
 * Includes schema.org ManufacturingProcess compliance fields
 */
export const CraftsmanshipContentSchema = z.object({
  materials: MaterialsSchema,
  construction: ConstructionSchema,
  quality_checks: z.array(z.string()).min(1, "At least one quality check required"),
  factory_story_link: z.string().url("Invalid factory story URL").optional(),
  care_instructions: z.string().optional(),
  // schema.org ManufacturingProcess required fields
  productionDate: z.string().datetime("Invalid production date").optional(),
  manufacturer: ManufacturerSchema.optional(),
  sku: z.string().optional(),
  model: z.string().optional(),
});

export type CraftsmanshipContent = z.infer<typeof CraftsmanshipContentSchema>;

/**
 * Partial schema for incremental form updates
 * All fields are optional to support partial saves
 */
export const PartialCraftsmanshipSchema = CraftsmanshipContentSchema.partial();

export type PartialCraftsmanshipContent = z.infer<typeof PartialCraftsmanshipSchema>;

/**
 * Helper function to validate craftsmanship content
 * Returns parsed data on success, error on failure
 */
export function validateCraftsmanshipContent(
  data: unknown
): { success: true; data: CraftsmanshipContent } | { success: false; error: z.ZodError } {
  const result = CraftsmanshipContentSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: result.error };
}

/**
 * Helper function to validate partial craftsmanship content
 * Useful for incremental form saves
 */
export function validatePartialCraftsmanshipContent(
  data: unknown
): { success: true; data: PartialCraftsmanshipContent } | { success: false; error: z.ZodError } {
  const result = PartialCraftsmanshipSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: result.error };
}

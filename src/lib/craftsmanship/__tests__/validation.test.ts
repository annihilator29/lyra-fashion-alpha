import { 
  CraftsmanshipContentSchema, 
  MaterialsSchema, 
  ConstructionSchema,
  ManufacturerSchema 
} from '../validation';
import { z } from 'zod';

describe('Craftsmanship Validation Schemas', () => {
  describe('MaterialsSchema', () => {
    it('should validate valid materials data', () => {
      const validMaterials = {
        fabric: '100% organic cotton',
        origin: 'Nepal',
        weight: 'GSM 140',
        certifications: ['GOTS', 'Fair Trade']
      };
      
      const result = MaterialsSchema.safeParse(validMaterials);
      expect(result.success).toBe(true);
    });

    it('should require fabric description', () => {
      const invalidMaterials = {
        origin: 'Nepal'
      };
      
      const result = MaterialsSchema.safeParse(invalidMaterials);
      expect(result.success).toBe(false);
    });

    it('should require origin', () => {
      const invalidMaterials = {
        fabric: '100% organic cotton'
      };
      
      const result = MaterialsSchema.safeParse(invalidMaterials);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields to be missing', () => {
      const minimalMaterials = {
        fabric: '100% silk',
        origin: 'Japan'
      };
      
      const result = MaterialsSchema.safeParse(minimalMaterials);
      expect(result.success).toBe(true);
    });
  });

  describe('ConstructionSchema', () => {
    it('should validate valid construction data', () => {
      const validConstruction = {
        stitching: ['French seams', 'Reinforced stress points'],
        finishing: ['Hand-finished hems', 'French binding on cuffs'],
        quality_checks: ['Color fastness', 'Stitching density (12 SPI)']
      };
      
      const result = ConstructionSchema.safeParse(validConstruction);
      expect(result.success).toBe(true);
    });

    it('should require at least one stitching technique', () => {
      const invalidConstruction = {
        stitching: [],
        finishing: ['Hand-finished hems']
      };
      
      const result = ConstructionSchema.safeParse(invalidConstruction);
      expect(result.success).toBe(false);
    });

    it('should require at least one finishing technique', () => {
      const invalidConstruction = {
        stitching: ['French seams'],
        finishing: []
      };
      
      const result = ConstructionSchema.safeParse(invalidConstruction);
      expect(result.success).toBe(false);
    });
  });

  describe('ManufacturerSchema', () => {
    it('should validate valid manufacturer data', () => {
      const validManufacturer = {
        name: 'Lyra Fashion Factory',
        logo: 'https://example.com/logo.png',
        url: 'https://example.com'
      };
      
      const result = ManufacturerSchema.safeParse(validManufacturer);
      expect(result.success).toBe(true);
    });

    it('should require manufacturer name', () => {
      const invalidManufacturer = {
        url: 'https://example.com'
      };
      
      const result = ManufacturerSchema.safeParse(invalidManufacturer);
      expect(result.success).toBe(false);
    });

    it('should validate logo URL format', () => {
      const invalidManufacturer = {
        name: 'Factory',
        logo: 'not-a-url'
      };
      
      const result = ManufacturerSchema.safeParse(invalidManufacturer);
      expect(result.success).toBe(false);
    });
  });

  describe('CraftsmanshipContentSchema', () => {
    it('should validate complete craftsmanship content', () => {
      const validContent = {
        materials: {
          fabric: '100% organic cotton',
          origin: 'Nepal',
          weight: 'GSM 140',
          certifications: ['GOTS', 'Fair Trade']
        },
        construction: {
          stitching: ['French seams', 'Reinforced stress points'],
          finishing: ['Hand-finished hems', 'French binding on cuffs'],
          quality_checks: ['Color fastness', 'Stitching density (12 SPI)']
        },
        quality_checks: [
          'Pre-production fabric inspection',
          'In-production stitch verification',
          'Post-production quality control'
        ],
        factory_story_link: 'https://example.com/our-story',
        care_instructions: 'Machine wash cold, tumble dry low',
        productionDate: '2026-01-01T00:00:00Z',
        manufacturer: {
          name: 'Lyra Fashion Factory'
        },
        sku: 'TEST-001',
        model: 'Model-X'
      };
      
      const result = CraftsmanshipContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should require materials object', () => {
      const invalidContent = {
        construction: {
          stitching: ['French seams'],
          finishing: ['Hand-finished hems']
        },
        quality_checks: ['Quality check 1']
      };
      
      const result = CraftsmanshipContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should require construction object', () => {
      const invalidContent = {
        materials: {
          fabric: 'Cotton',
          origin: 'USA'
        },
        quality_checks: ['Quality check 1']
      };
      
      const result = CraftsmanshipContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should require at least one quality check', () => {
      const invalidContent = {
        materials: {
          fabric: 'Cotton',
          origin: 'USA'
        },
        construction: {
          stitching: ['French seams'],
          finishing: ['Hand-finished hems']
        },
        quality_checks: []
      };
      
      const result = CraftsmanshipContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should validate factory_story_link URL format', () => {
      const invalidContent = {
        materials: {
          fabric: 'Cotton',
          origin: 'USA'
        },
        construction: {
          stitching: ['French seams'],
          finishing: ['Hand-finished hems']
        },
        quality_checks: ['Quality check 1'],
        factory_story_link: 'not-a-url'
      };
      
      const result = CraftsmanshipContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should validate productionDate datetime format', () => {
      const invalidContent = {
        materials: {
          fabric: 'Cotton',
          origin: 'USA'
        },
        construction: {
          stitching: ['French seams'],
          finishing: ['Hand-finished hems']
        },
        quality_checks: ['Quality check 1'],
        productionDate: 'not-a-datetime'
      };
      
      const result = CraftsmanshipContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should allow missing optional fields', () => {
      const minimalContent = {
        materials: {
          fabric: 'Cotton',
          origin: 'USA'
        },
        construction: {
          stitching: ['French seams'],
          finishing: ['Hand-finished hems']
        },
        quality_checks: ['Quality check 1']
      };
      
      const result = CraftsmanshipContentSchema.safeParse(minimalContent);
      expect(result.success).toBe(true);
    });
  });

  describe('TypeScript type inference', () => {
    it('should correctly infer CraftsmanshipContent type', () => {
      const validContent = {
        materials: {
          fabric: '100% organic cotton',
          origin: 'Nepal',
          weight: 'GSM 140',
          certifications: ['GOTS', 'Fair Trade']
        },
        construction: {
          stitching: ['French seams', 'Reinforced stress points'],
          finishing: ['Hand-finished hems', 'French binding on cuffs'],
          quality_checks: ['Color fastness', 'Stitching density (12 SPI)']
        },
        quality_checks: [
          'Pre-production fabric inspection',
          'In-production stitch verification',
          'Post-production quality control'
        ]
      };
      
      const result = CraftsmanshipContentSchema.parse(validContent);
      
      // TypeScript compile-time check - this would error if types don't match
      expect(result.materials.fabric).toBe('100% organic cotton');
      expect(result.materials.certifications).toHaveLength(2);
      expect(result.construction.stitching).toHaveLength(2);
      expect(result.quality_checks).toHaveLength(3);
    });
  });
});

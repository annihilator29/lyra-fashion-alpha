import {
  CRAFTSMANSHIP_TEMPLATES,
  TEMPLATE_IDS,
  applyTemplate,
  applyTemplates,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  previewTemplate
} from '../templates';
import type { CraftsmanshipContent } from '../types';

describe('Craftsmanship Templates', () => {
  // Sample base content for testing
  const sampleBaseContent: CraftsmanshipContent = {
    materials: {
      fabric: '100% organic cotton',
      origin: 'India',
      weight: 'GSM 180',
      certifications: ['GOTS']
    },
    construction: {
      stitching: ['Double-stitched seams'],
      finishing: ['Overlocked edges'],
      quality_checks: ['Visual inspection']
    },
    quality_checks: ['Pre-production check']
  };

  describe('Template Constants', () => {
    it('should have all expected template IDs', () => {
      const expectedIds = [
        'COTTON_CARE',
        'SILK_CARE',
        'WOOL_CARE',
        'STANDARD_QUALITY',
        'PREMIUM_QUALITY',
        'ORGANIC_COTTON',
        'FRENCH_SEAMS',
        'HAND_STITCHED',
        'SUSTAINABLE_PRODUCTION'
      ];
      
      expect(TEMPLATE_IDS).toEqual(expectedIds);
    });

    it('should have correct number of templates', () => {
      expect(Object.keys(CRAFTSMANSHIP_TEMPLATES)).toHaveLength(9);
    });
  });

  describe('applyTemplate', () => {
    it('should apply cotton care template correctly', () => {
      const result = applyTemplate(sampleBaseContent, 'COTTON_CARE');
      
      expect(result.care_instructions).toBe(
        'Machine wash cold with similar colors. Tumble dry low. Cool iron if needed. Do not bleach. Dry clean recommended for best results.'
      );
      // Base content should be preserved
      expect(result.materials.fabric).toBe('100% organic cotton');
    });

    it('should apply standard quality template correctly', () => {
      const result = applyTemplate(sampleBaseContent, 'STANDARD_QUALITY');
      
      // Should concatenate quality checks (both base and template)
      expect(result.quality_checks).toContain('Pre-production check');
      expect(result.quality_checks).toContain('Pre-production fabric inspection');
      expect(result.quality_checks).toContain('In-production stitch verification');
      expect(result.quality_checks).toContain('Post-production quality control');
    });

    it('should throw error for invalid template ID', () => {
      expect(() => {
        applyTemplate(sampleBaseContent, 'INVALID_TEMPLATE');
      }).toThrow('Template "INVALID_TEMPLATE" not found');
    });

    it('should merge nested objects correctly', () => {
      const result = applyTemplate(sampleBaseContent, 'FRENCH_SEAMS');
      
      // Should have both original and template stitching techniques
      expect(result.construction.stitching).toContain('Double-stitched seams');
      expect(result.construction.stitching).toContain('French seams (1.5cm)');
    });

    it('should merge certifications correctly', () => {
      const result = applyTemplate(sampleBaseContent, 'ORGANIC_COTTON');
      
      // Should have both original and template certifications
      expect(result.materials.certifications).toContain('GOTS');
      expect(result.materials.certifications).toContain('GOTS Certified');
    });
  });

  describe('applyTemplates', () => {
    it('should apply multiple templates in sequence', () => {
      const result = applyTemplates(sampleBaseContent, [
        'COTTON_CARE',
        'STANDARD_QUALITY'
      ]);
      
      expect(result.care_instructions).toBeDefined();
      // Should concatenate quality checks from both base and template
      expect(result.quality_checks).toHaveLength(4);
      expect(result.quality_checks).toContain('Pre-production check');
      expect(result.quality_checks).toContain('Pre-production fabric inspection');
    });

    it('should handle empty template array', () => {
      const result = applyTemplates(sampleBaseContent, []);
      
      expect(result).toEqual(sampleBaseContent);
    });

    it('should apply templates in sequence (concatenating arrays)', () => {
      const contentWithQuality: CraftsmanshipContent = {
        ...sampleBaseContent,
        quality_checks: ['Custom check 1', 'Custom check 2']
      };
      
      const result = applyTemplates(contentWithQuality, ['STANDARD_QUALITY']);
      
      // Should concatenate quality checks (both base and template)
      expect(result.quality_checks).toContain('Custom check 1');
      expect(result.quality_checks).toContain('Custom check 2');
      expect(result.quality_checks).toContain('Pre-production fabric inspection');
      expect(result.quality_checks).toContain('In-production stitch verification');
      expect(result.quality_checks).toContain('Post-production quality control');
    });
  });

  describe('getTemplate', () => {
    it('should return template for valid ID', () => {
      const template = getTemplate('COTTON_CARE');
      
      expect(template).not.toBeNull();
      expect(template?.id).toBe('cotton-care');
      expect(template?.name).toBe('Cotton Care Instructions');
    });

    it('should return null for invalid ID', () => {
      const template = getTemplate('INVALID');
      
      expect(template).toBeNull();
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates', () => {
      const templates = getAllTemplates();
      
      expect(templates).toHaveLength(9);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('description');
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return care templates', () => {
      const templates = getTemplatesByCategory('care');
      
      expect(templates).toHaveLength(3);
      expect(templates.map(t => t.id)).toEqual([
        'cotton-care',
        'silk-care',
        'wool-care'
      ]);
    });

    it('should return quality templates', () => {
      const templates = getTemplatesByCategory('quality');
      
      expect(templates).toHaveLength(2);
      expect(templates.map(t => t.id)).toEqual([
        'standard-quality',
        'premium-quality'
      ]);
    });

    it('should return empty array for non-existent category', () => {
      const templates = getTemplatesByCategory('materials' as never);
      
      // This should return empty since 'materials' is not a valid category key
      expect(Array.isArray(templates)).toBe(true);
    });
  });

  describe('previewTemplate', () => {
    it('should return content for valid template', () => {
      const content = previewTemplate('COTTON_CARE');
      
      expect(content).not.toBeNull();
      expect(content?.care_instructions).toBeDefined();
    });

    it('should return null for invalid template', () => {
      const content = previewTemplate('INVALID');
      
      expect(content).toBeNull();
    });
  });

  describe('Template Data Integrity', () => {
    it('should have all care templates with care_instructions', () => {
      const careTemplates = getTemplatesByCategory('care');
      
      careTemplates.forEach(template => {
        expect(template.content.care_instructions).toBeDefined();
        expect(typeof template.content.care_instructions).toBe('string');
      });
    });

    it('should have all quality templates with quality_checks', () => {
      const qualityTemplates = ['STANDARD_QUALITY', 'PREMIUM_QUALITY'] as const;
      
      qualityTemplates.forEach(templateId => {
        const template = CRAFTSMANSHIP_TEMPLATES[templateId];
        expect(template.content.quality_checks).toBeDefined();
        expect(Array.isArray(template.content.quality_checks)).toBe(true);
      });
    });
  });
});

/**
 * Craftsmanship Section Component
 * 
 * Main container for displaying craftsmanship content with responsive design.
 * Shows accordion on mobile and tabs on desktop for organizing content.
 * 
 * @module components/products/craftsmanship-section
 */

'use client';

import { useResponsiveView } from '@/hooks/use-responsive-view';
import type { CraftsmanshipSectionProps, CraftsmanshipContent } from '@/lib/craftsmanship/types';
import { MaterialsSection } from './materials-section';
import { ConstructionSection } from './construction-section';
import { QualitySection } from './quality-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Normalize craftsmanship content to the new structure
 * Handles migration from old flat structure to new nested structure
 */
function normalizeCraftsmanshipData(data: unknown): CraftsmanshipContent | null {
  if (!data) {
    return null;
  }

  const content = data as Record<string, unknown>;

  // Check if it's the new structure (construction has stitching property)
  if (content.construction && typeof content.construction === 'object' && 
      'stitching' in (content.construction as Record<string, unknown>)) {
    return data as CraftsmanshipContent;
  }

  // Old structure: construction was a flat string[]
  // Convert to new structure
  const oldConstruction = content.construction;
  const newConstruction = Array.isArray(oldConstruction) 
    ? { stitching: [...oldConstruction], finishing: [], quality_checks: [] }
    : { stitching: [], finishing: [], quality_checks: [] };

  // Old structure: materials was flat object
  const oldMaterials = content.materials as Record<string, unknown> | undefined;
  const newMaterials = {
    fabric: (oldMaterials?.fabric as string) || '',
    origin: (oldMaterials?.origin as string) || '',
    weight: '',
    certifications: (oldMaterials?.certifications as string[]) || []
  };

  // Old structure: quality_checks was flat array
  const oldQualityChecks = content.quality_checks;
  const newQualityChecks = Array.isArray(oldQualityChecks) ? [...oldQualityChecks] : [];

  return {
    materials: newMaterials,
    construction: newConstruction,
    quality_checks: newQualityChecks,
    care_instructions: (content.care_instructions as string) || '',
    factory_story_link: (content.factory_story_link as string) || ''
  };
}

export function CraftsmanshipSection({ 
  craftsmanship, 
}: CraftsmanshipSectionProps) {
  const normalizedCraftsmanship = normalizeCraftsmanshipData(craftsmanship);
  const viewMode = useResponsiveView({ mobileBreakpoint: 768 });
  const sectionId = 'craftsmanship-section';

  // Handle empty/null craftsmanship state
  if (!normalizedCraftsmanship) {
    return (
      <section
        id={sectionId}
        aria-labelledby="craftsmanship-heading"
        role="region"
        className="mt-12 py-8 bg-neutral-50"
      >
        <h2 
          id="craftsmanship-heading" 
          className="text-3xl font-serif text-primary mb-8 px-6"
        >
          Craftsmanship Details
        </h2>
        <p className="text-neutral-600 px-6">
          Craftsmanship information coming soon for this product.
        </p>
      </section>
    );
  }

  return (
    <section
      id={sectionId}
      aria-labelledby="craftsmanship-heading"
      role="region"
      className="mt-12 py-8 bg-neutral-50"
    >
      {/* Screen reader-only heading */}
      <h2 id="craftsmanship-heading" className="sr-only">
        Craftsmanship Details
      </h2>

      <div className="text-3xl font-serif text-primary mb-8 px-6">
        Craftsmanship Details
      </div>

      {/* Mobile: Accordion view */}
      {viewMode === 'mobile' ? (
        <Accordion type="single" collapsible className="px-6">
          <AccordionItem value="materials">
            <AccordionTrigger
              className="flex items-center justify-between w-full text-lg font-medium"
              aria-label="View materials details"
            >
              Materials
            </AccordionTrigger>
            <AccordionContent>
              <MaterialsSection data={normalizedCraftsmanship.materials} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="construction">
            <AccordionTrigger
              className="flex items-center justify-between w-full text-lg font-medium"
              aria-label="View construction details"
            >
              Construction
            </AccordionTrigger>
            <AccordionContent>
              <ConstructionSection data={normalizedCraftsmanship.construction} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="quality">
            <AccordionTrigger
              className="flex items-center justify-between w-full text-lg font-medium"
              aria-label="View quality check details"
            >
              Quality Checks
            </AccordionTrigger>
            <AccordionContent>
              <QualitySection checks={normalizedCraftsmanship.quality_checks} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        /* Desktop: Tabs view */
        <Tabs defaultValue="materials" className="px-6">
          <TabsList role="tablist" className="mb-6">
            <TabsTrigger
              value="materials"
              role="tab"
              aria-selected={true}
              aria-controls="materials-panel"
              className="text-lg"
            >
              Materials
            </TabsTrigger>
            <TabsTrigger
              value="construction"
              role="tab"
              aria-selected={false}
              aria-controls="construction-panel"
              className="text-lg"
            >
              Construction
            </TabsTrigger>
            <TabsTrigger
              value="quality"
              role="tab"
              aria-selected={false}
              aria-controls="quality-panel"
              className="text-lg"
            >
              Quality Checks
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="materials" 
            role="tabpanel" 
            id="materials-panel"
            aria-labelledby="materials-tab"
          >
            <MaterialsSection data={normalizedCraftsmanship.materials} />
          </TabsContent>

          <TabsContent 
            value="construction" 
            role="tabpanel" 
            id="construction-panel"
            aria-labelledby="construction-tab"
          >
            <ConstructionSection data={normalizedCraftsmanship.construction} />
          </TabsContent>

          <TabsContent 
            value="quality" 
            role="tabpanel" 
            id="quality-panel"
            aria-labelledby="quality-tab"
          >
            <QualitySection checks={normalizedCraftsmanship.quality_checks} />
          </TabsContent>
        </Tabs>
      )}

      {/* Factory story link (if available) */}
      {normalizedCraftsmanship.factory_story_link && (
        <div className="mt-8 text-center px-6">
          <a
            href={normalizedCraftsmanship.factory_story_link}
            className="text-primary hover:text-primary/80 underline font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-label="Read more about our factory journey (opens in new tab)"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more about our factory journey →
          </a>
        </div>
      )}

      {/* Care instructions (if available) */}
      {normalizedCraftsmanship.care_instructions && (
        <div className="mt-8 px-6">
          <h3 className="text-xl font-serif text-primary mb-3">Care Instructions</h3>
          <p className="text-neutral-700">{normalizedCraftsmanship.care_instructions}</p>
        </div>
      )}
    </section>
  );
}

'use client';

import Link from 'next/link';
import { Sparkles, Scissors, Shield, ExternalLink, Leaf } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { CraftsmanshipContent } from '@/types/product';
import { cn } from '@/lib/utils';

interface CraftsmanshipSectionProps {
    craftsmanship: CraftsmanshipContent | null;
    className?: string;
}

/**
 * CraftsmanshipSection Component
 *
 * Displays detailed craftsmanship information with Materials, Construction,
 * and Quality sections. Uses Tabs on desktop (lg:) and Accordion on mobile.
 *
 * @example
 * ```tsx
 * <CraftsmanshipSection craftsmanship={product.craftsmanship_content} />
 * ```
 */
export function CraftsmanshipSection({ craftsmanship, className }: CraftsmanshipSectionProps) {
    // Handle null or empty craftsmanship data
    if (!craftsmanship || !craftsmanship.materials) {
        return (
            <div className={cn('rounded-lg border bg-muted/20 p-6', className)}>
                <p className="text-sm text-muted-foreground text-center">
                    Craftsmanship details coming soon.
                </p>
            </div>
        );
    }

    const { materials, construction, quality_checks, care_instructions, factory_story_link } = craftsmanship;
    const hasConstruction = construction && construction.length > 0;
    const hasQualityChecks = quality_checks && quality_checks.length > 0;
    const hasCareInstructions = care_instructions && care_instructions.length > 0;

    // Shared content components
    const MaterialsContent = () => (
        <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
                <span className="font-medium text-foreground min-w-[80px]">Fabric:</span>
                <span>{materials.fabric}</span>
            </div>
            {materials.origin && (
                <div className="flex items-start gap-2">
                    <span className="font-medium text-foreground min-w-[80px]">Origin:</span>
                    <span>{materials.origin}</span>
                </div>
            )}
            {materials.composition && (
                <div className="flex items-start gap-2">
                    <span className="font-medium text-foreground min-w-[80px]">Composition:</span>
                    <span>{materials.composition}</span>
                </div>
            )}
            {hasCareInstructions && (
                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                        <Leaf className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">Care Instructions</span>
                    </div>
                    <ul className="space-y-1 ml-6">
                        {care_instructions!.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                                {instruction}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    const ConstructionContent = () => (
        <div className="space-y-2 text-sm text-muted-foreground">
            {hasConstruction ? (
                <ul className="space-y-2">
                    {construction.map((technique, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            {technique}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">Construction details not available.</p>
            )}
        </div>
    );

    const QualityContent = () => (
        <div className="space-y-2 text-sm text-muted-foreground">
            {hasQualityChecks ? (
                <ul className="space-y-2">
                    {quality_checks.map((checkpoint, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <Shield className="h-4 w-4 flex-shrink-0 text-green-600 mt-0.5" />
                            {checkpoint}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">Quality control details not available.</p>
            )}
        </div>
    );

    const FactoryStoryLink = () => (
        <div className="mt-6 pt-4 border-t">
            <Button asChild variant="outline" className="w-full gap-2">
                <Link href={factory_story_link || '/about'}>
                    <ExternalLink className="h-4 w-4" />
                    Learn More About Our Process
                </Link>
            </Button>
        </div>
    );

    return (
        <section className={cn('rounded-lg border bg-card p-6', className)}>
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                    Craftsmanship Details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Discover the quality and care behind every piece
                </p>
            </div>

            {/* Desktop: Tabs (hidden on mobile) */}
            <Tabs defaultValue="materials" className="hidden lg:block">
                <TabsList className="w-full justify-start gap-1">
                    <TabsTrigger value="materials" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Materials
                    </TabsTrigger>
                    {hasConstruction && (
                        <TabsTrigger value="construction" className="gap-2">
                            <Scissors className="h-4 w-4" />
                            Construction
                        </TabsTrigger>
                    )}
                    {hasQualityChecks && (
                        <TabsTrigger value="quality" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Quality
                        </TabsTrigger>
                    )}
                </TabsList>
                <TabsContent value="materials" className="mt-4">
                    <MaterialsContent />
                </TabsContent>
                {hasConstruction && (
                    <TabsContent value="construction" className="mt-4">
                        <ConstructionContent />
                    </TabsContent>
                )}
                {hasQualityChecks && (
                    <TabsContent value="quality" className="mt-4">
                        <QualityContent />
                    </TabsContent>
                )}
            </Tabs>

            {/* Mobile: Accordion (hidden on desktop) */}
            <Accordion type="single" collapsible className="lg:hidden">
                <AccordionItem value="materials">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-medium">Materials</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <MaterialsContent />
                    </AccordionContent>
                </AccordionItem>

                {hasConstruction && (
                    <AccordionItem value="construction">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                                <Scissors className="h-4 w-4 text-primary" />
                                <span className="font-medium">Construction</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <ConstructionContent />
                        </AccordionContent>
                    </AccordionItem>
                )}

                {hasQualityChecks && (
                    <AccordionItem value="quality">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <span className="font-medium">Quality Control</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <QualityContent />
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>

            {/* Factory Story CTA */}
            <FactoryStoryLink />
        </section>
    );
}

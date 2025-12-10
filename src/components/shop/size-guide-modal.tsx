'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Ruler } from 'lucide-react';
import { SIZE_GUIDE_DATA, type SizeMeasurement } from '@/types/product';
import { cn } from '@/lib/utils';

interface SizeGuideModalProps {
    category: string;
    className?: string;
}

/**
 * SizeGuideModal Component
 *
 * Modal displaying category-specific sizing information with measurements.
 * Uses shadcn/ui Dialog component with proper accessibility.
 *
 * @example
 * ```tsx
 * <SizeGuideModal category="dresses" />
 * ```
 */
export function SizeGuideModal({ category, className }: SizeGuideModalProps) {
    // Get size guide data for this category, fallback to dresses
    const measurements: SizeMeasurement[] =
        SIZE_GUIDE_DATA[category.toLowerCase()] || SIZE_GUIDE_DATA.dresses;

    // Check which columns to show (some categories don't have all measurements)
    const showBust = measurements.some((m) => m.bust !== '-');
    const showWaist = measurements.some((m) => m.waist !== '-');
    const showHip = measurements.some((m) => m.hip !== '-');
    const showLength = measurements.some((m) => m.length !== '-');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn('gap-1.5 text-muted-foreground hover:text-foreground', className)}
                >
                    <Ruler className="h-4 w-4" />
                    Size Guide
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-serif text-xl">
                        Size Guide
                    </DialogTitle>
                    <DialogDescription>
                        Find your perfect fit with our measurement guide for{' '}
                        {category.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Measurement Table */}
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-foreground">
                                        Size
                                    </th>
                                    {showBust && (
                                        <th className="px-4 py-3 text-left font-medium text-foreground">
                                            Bust
                                        </th>
                                    )}
                                    {showWaist && (
                                        <th className="px-4 py-3 text-left font-medium text-foreground">
                                            Waist
                                        </th>
                                    )}
                                    {showHip && (
                                        <th className="px-4 py-3 text-left font-medium text-foreground">
                                            Hip
                                        </th>
                                    )}
                                    {showLength && (
                                        <th className="px-4 py-3 text-left font-medium text-foreground">
                                            Length
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {measurements.map((measurement) => (
                                    <tr
                                        key={measurement.size}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {measurement.size}
                                        </td>
                                        {showBust && (
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {measurement.bust}
                                            </td>
                                        )}
                                        {showWaist && (
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {measurement.waist}
                                            </td>
                                        )}
                                        {showHip && (
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {measurement.hip}
                                            </td>
                                        )}
                                        {showLength && (
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {measurement.length}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* How to Measure Section */}
                    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                        <h4 className="font-medium text-foreground">How to Measure</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                    1
                                </span>
                                <div>
                                    <strong className="text-foreground">Bust: </strong>
                                    Measure around the fullest part of your bust, keeping the tape
                                    parallel to the floor.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                    2
                                </span>
                                <div>
                                    <strong className="text-foreground">Waist: </strong>
                                    Measure around your natural waistline, the narrowest part of
                                    your torso.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                    3
                                </span>
                                <div>
                                    <strong className="text-foreground">Hip: </strong>
                                    Measure around the fullest part of your hips, about 8 inches
                                    below your waist.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                    4
                                </span>
                                <div>
                                    <strong className="text-foreground">Length: </strong>
                                    Measure from the highest point of your shoulder to where you
                                    want the garment to end.
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Tips */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Tip:</strong> If you&apos;re between sizes, we recommend
                            sizing up for a more comfortable fit. All measurements are in inches
                            unless otherwise noted.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

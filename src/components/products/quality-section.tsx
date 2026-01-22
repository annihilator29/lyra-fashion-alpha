/**
 * Quality Section Component
 * 
 * Displays quality assurance checks and verification processes.
 * 
 * @module components/products/quality-section
 */

import type { QualitySectionProps } from '@/lib/craftsmanship/types';
import { CheckCircle2 } from 'lucide-react';

export function QualitySection({ checks }: QualitySectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-serif text-primary mb-4">Quality Assurance</h3>
      <ul className="space-y-3">
        {checks.map((check, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle2 
              className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" 
              aria-hidden="true"
            />
            <span className="text-neutral-700">{check}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

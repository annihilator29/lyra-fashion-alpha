/**
 * Construction Section Component
 * 
 * Displays construction techniques including stitching and finishing details.
 * 
 * @module components/products/construction-section
 */

import type { ConstructionSectionProps } from '@/lib/craftsmanship/types';

export function ConstructionSection({ data }: ConstructionSectionProps) {
  return (
    <div className="space-y-6">
      {/* Stitching */}
      <div>
        <h3 className="text-xl font-serif text-primary mb-3">Stitching</h3>
        <ul className="list-disc list-inside space-y-2 text-neutral-700">
          {data.stitching.map((technique) => (
            <li key={technique}>{technique}</li>
          ))}
        </ul>
      </div>

      {/* Finishing */}
      <div>
        <h3 className="text-xl font-serif text-primary mb-3">Finishing</h3>
        <ul className="list-disc list-inside space-y-2 text-neutral-700">
          {data.finishing.map((technique) => (
            <li key={technique}>{technique}</li>
          ))}
        </ul>
      </div>

      {/* Quality Standards (optional) */}
      {data.quality_checks && data.quality_checks.length > 0 && (
        <div>
          <h3 className="text-xl font-serif text-primary mb-3">Quality Standards</h3>
          <ul className="list-disc list-inside space-y-2 text-neutral-700">
            {data.quality_checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

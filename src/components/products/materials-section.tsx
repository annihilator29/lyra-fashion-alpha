/**
 * Materials Section Component
 * 
 * Displays materials information including fabric type, origin, weight, and certifications.
 * 
 * @module components/products/materials-section
 */

import type { MaterialsSectionProps } from '@/lib/craftsmanship/types';
import { Badge } from '@/components/ui/badge';

export function MaterialsSection({ data }: MaterialsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Fabric */}
      <div>
        <h3 className="text-xl font-serif text-primary mb-2">Fabric</h3>
        <p className="text-neutral-700">{data.fabric}</p>
      </div>

      {/* Origin (optional) */}
      {data.origin && (
        <div>
          <h3 className="text-xl font-serif text-primary mb-2">Origin</h3>
          <p className="text-neutral-700">{data.origin}</p>
        </div>
      )}

      {/* Weight (optional) */}
      {data.weight && (
        <div>
          <h3 className="text-xl font-serif text-primary mb-2">Weight</h3>
          <p className="text-neutral-700">{data.weight}</p>
        </div>
      )}

      {/* Certifications (optional) */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h3 className="text-xl font-serif text-primary mb-3">Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((cert) => (
              <Badge
                key={cert}
                variant="outline"
                aria-label={`Certification: ${cert}`}
                className="focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

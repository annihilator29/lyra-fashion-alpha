'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ReviewSortOption, ReviewFilters } from '@/lib/reviews/types';
import { cn } from '@/lib/utils';

interface ReviewFiltersProps {
  filters: ReviewFilters;
  onFiltersChange: (filters: ReviewFilters) => void;
  totalReviews: number;
  className?: string;
}

const sortOptions: { value: ReviewSortOption; label: string }[] = [
  { value: 'newest', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
  { value: 'verified', label: 'Verified Purchases First' },
];

export function ReviewFiltersComponent({
  filters,
  onFiltersChange,
  totalReviews,
  className,
}: ReviewFiltersProps) {
  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sort: value as ReviewSortOption,
    });
  };

  const handleVerifiedChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      verifiedOnly: checked,
    });
  };

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-b border-neutral-200', className)}>
      <p className="text-sm text-neutral-600">
        Showing {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
      </p>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="verified-only"
            checked={filters.verifiedOnly}
            onCheckedChange={handleVerifiedChange}
            className="border-neutral-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
          />
          <Label
            htmlFor="verified-only"
            className="text-sm font-medium text-neutral-700 cursor-pointer"
          >
            Verified purchases only
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 whitespace-nowrap">Sort by:</span>
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] border-neutral-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

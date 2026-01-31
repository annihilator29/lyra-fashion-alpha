'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ReviewSummary as ReviewSummaryType } from '@/lib/reviews/types';
import { StarRating } from './star-rating';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  summary: ReviewSummaryType | null;
  className?: string;
}

export function ReviewSummary({ summary, className }: ReviewSummaryProps) {
  if (!summary) {
    return null;
  }

  const { average_rating, total_reviews, rating_distribution, verified_count } = summary;

  const getPercentage = (count: number) => {
    if (total_reviews === 0) return 0;
    return Math.round((count / total_reviews) * 100);
  };

  return (
    <Card className={cn('border-neutral-200', className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl font-semibold text-secondary-600">
              {average_rating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <StarRating rating={Math.round(average_rating)} size="sm" />
              <span className="text-sm text-neutral-600 mt-1">
                Based on {total_reviews} {total_reviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
          {verified_count > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-md">
              <svg
                className="w-4 h-4 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-primary-700">
                {verified_count} verified {verified_count === 1 ? 'purchase' : 'purchases'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = rating_distribution[rating as keyof typeof rating_distribution];
            const percentage = getPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-700 w-8">{rating} star</span>
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-neutral-600 w-10 text-right">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

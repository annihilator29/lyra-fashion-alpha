'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useReviews } from '@/hooks/use-reviews';
import { ReviewSummary } from './review-summary';
import { ReviewCard } from './review-card';
import { ReviewFiltersComponent as ReviewFilters } from './review-filters';
import {
  ReviewSummarySkeleton,
  ReviewFiltersSkeleton,
  ReviewListSkeleton,
} from './review-skeleton';
import { cn } from '@/lib/utils';

interface ReviewSectionProps {
  productId: string;
  className?: string;
}

export function ReviewSection({ productId, className }: ReviewSectionProps) {
  const {
    reviews,
    summary,
    loading,
    error,
    hasMore,
    loadMore,
    markHelpful,
    filters,
    setFilters,
  } = useReviews(productId);

  if (error) {
    return (
      <div className={cn('py-8', className)}>
        <p className="text-center text-neutral-600">
          Failed to load reviews. Please try again later.
        </p>
      </div>
    );
  }

  const hasReviews = summary && summary.total_reviews > 0;

  return (
    <section className={cn('py-8', className)}>
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-semibold text-neutral-900 mb-2">
          Customer Reviews
        </h2>
        <Separator className="bg-neutral-200" />
      </div>

      {loading && !reviews.length ? (
        <div className="space-y-6">
          <ReviewSummarySkeleton />
          <ReviewFiltersSkeleton />
          <ReviewListSkeleton count={3} />
        </div>
      ) : !hasReviews ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-2">No reviews yet</p>
          <p className="text-sm text-neutral-500">
            Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <ReviewSummary summary={summary} />

          <ReviewFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalReviews={reviews.length}
          />

          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onMarkHelpful={markHelpful}
              />
            ))}
          </div>

          {loading && <ReviewListSkeleton count={2} />}

          {hasMore && !loading && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                className="border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Load More Reviews
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

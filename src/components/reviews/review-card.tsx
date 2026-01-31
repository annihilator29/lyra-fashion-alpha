'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Review } from '@/lib/reviews/types';
import { StarRating } from './star-rating';
import { HelpfulButton } from './helpful-button';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
  onMarkHelpful: (reviewId: string) => Promise<void>;
  className?: string;
}

export function ReviewCard({ review, onMarkHelpful, className }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFitFeedbackText = (fit: string) => {
    switch (fit) {
      case 'true-to-size':
        return 'Fits true to size';
      case 'small':
        return 'Runs small';
      case 'large':
        return 'Runs large';
      default:
        return null;
    }
  };

  const fitText = getFitFeedbackText(review.fit_feedback);

  const getCustomerInitials = (name: string | null | undefined) => {
    if (!name) return 'AU';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Card className={cn('border-neutral-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-sm font-medium text-neutral-600">
                {getCustomerInitials(review.customer?.name)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">
                  {review.customer?.name || 'Anonymous User'}
                </span>
                {review.verified && (
                  <Badge
                    variant="default"
                    className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-2 py-0.5"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
              </div>
              <span className="text-sm text-neutral-500">{formatDate(review.created_at)}</span>
            </div>
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h4 className="font-semibold text-neutral-900 mb-2">{review.title}</h4>
        <p className="text-neutral-700 leading-relaxed mb-4">{review.content}</p>

        {fitText && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-neutral-500">Fit:</span>
            <span className="text-sm font-medium text-neutral-700">{fitText}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <HelpfulButton
            reviewId={review.id}
            helpfulCount={review.helpful_count}
            onMarkHelpful={onMarkHelpful}
          />
        </div>
      </CardContent>
    </Card>
  );
}

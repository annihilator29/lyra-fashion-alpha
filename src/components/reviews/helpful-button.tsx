'use client';

import * as React from 'react';
import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpfulButtonProps {
  reviewId: string;
  helpfulCount: number;
  onMarkHelpful: (reviewId: string) => Promise<void>;
  className?: string;
}

export function HelpfulButton({
  reviewId,
  helpfulCount,
  onMarkHelpful,
  className,
}: HelpfulButtonProps) {
  const [isHelpful, setIsHelpful] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [displayCount, setDisplayCount] = React.useState(helpfulCount);

  const handleClick = async () => {
    if (isHelpful || isLoading) return;

    setIsLoading(true);
    setIsHelpful(true);
    setDisplayCount((prev) => prev + 1);

    try {
      await onMarkHelpful(reviewId);
    } catch {
      setIsHelpful(false);
      setDisplayCount((prev) => prev - 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isHelpful || isLoading}
      className={cn(
        'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
        isHelpful && 'text-primary-600 hover:text-primary-700 hover:bg-primary-50',
        className
      )}
    >
      <ThumbsUp
        className={cn(
          'w-4 h-4 mr-2 transition-all duration-200',
          isHelpful && 'fill-primary-600 text-primary-600 scale-110'
        )}
      />
      <span className="text-sm">
        Helpful ({displayCount})
      </span>
    </Button>
  );
}

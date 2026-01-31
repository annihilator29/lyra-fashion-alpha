'use client';

import * as React from 'react';
import { ReviewSection } from './review-section';
import { ReviewSummarySkeleton, ReviewFiltersSkeleton, ReviewListSkeleton } from './review-skeleton';
import { cn } from '@/lib/utils';

interface ReviewSectionWrapperProps {
  productId: string;
  className?: string;
}

/**
 * Review Section Wrapper with Intersection Observer lazy loading
 *
 * Delays loading of review section until it enters viewport.
 * Shows skeleton loading state until visible.
 *
 * @param productId - Product ID to load reviews for
 * @param className - Optional CSS class names
 */
export function ReviewSectionWrapper({ productId, className }: ReviewSectionWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load immediately if observer not supported
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Disconnect observer after first intersection
            observer.disconnect();
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.1, // Trigger when 10% visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={cn('min-h-[400px]', className)}>
      {isVisible ? (
        <ReviewSection productId={productId} />
      ) : (
        <section className="py-8">
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold text-neutral-900 mb-2">
              Customer Reviews
            </h2>
            <div className="h-px bg-neutral-200" />
          </div>
          <div className="space-y-6">
            <ReviewSummarySkeleton />
            <ReviewFiltersSkeleton />
            <ReviewListSkeleton count={3} />
          </div>
        </section>
      )}
    </div>
  );
}

// Import hooks at the bottom to avoid circular dependencies
import { useState, useEffect, useRef } from 'react';

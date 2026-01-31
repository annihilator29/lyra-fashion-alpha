'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Review Section
 *
 * Catches errors in the review section and displays graceful fallback UI.
 * Allows users to retry loading reviews without breaking the entire page.
 *
 * @example
 * ```tsx
 * <ReviewErrorBoundary>
 *   <ReviewSection productId={product.id} />
 * </ReviewErrorBoundary>
 * ```
 */
export class ReviewErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error('Review section error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className={cn('border-neutral-200 my-8', this.props.className)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Reviews Temporarily Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600">
              We&apos;re having trouble loading reviews right now. This doesn&apos;t affect the product
              details or your ability to make a purchase.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={this.handleRetry}
                className="border-neutral-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="ghost" asChild>
                <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
                  Reload Page
                </a>
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-neutral-500 hover:text-neutral-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-3 bg-neutral-100 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for functional components to handle review section errors
 *
 * Provides error state and retry functionality for review data fetching.
 */
export function useReviewErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleError = React.useCallback((err: Error) => {
    console.error('Review error caught:', err);
    setError(err);
  }, []);

  const retry = React.useCallback(() => {
    setError(null);
    setRetryCount((prev) => prev + 1);
  }, []);

  return {
    error,
    retryCount,
    handleError,
    retry,
    hasError: error !== null,
  };
}

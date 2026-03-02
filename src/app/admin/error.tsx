/**
 * Admin Error Boundary
 * Story 7.1a: Admin Dashboard - Foundation
 * Catches errors in the admin dashboard and displays a fallback UI
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Admin Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      
      <h2 className="mb-2 text-xl font-semibold">Something went wrong!</h2>
      
      <p className="mb-6 max-w-md text-muted-foreground">
        An error occurred while loading the admin dashboard. 
        Please try again or contact support if the problem persists.
      </p>
      
      {error.message && (
        <div className="mb-6 rounded-md bg-muted p-4 text-left">
          <p className="text-sm font-medium text-muted-foreground">Error details:</p>
          <code className="mt-1 block text-sm text-destructive">{error.message}</code>
        </div>
      )}
      
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/admin'} variant="outline">
          Go to Dashboard
        </Button>
      </div>
      
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}

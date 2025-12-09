'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Error Boundary for Category Pages
 *
 * Displays a user-friendly error message when product fetching fails.
 * Provides options to retry or navigate to homepage.
 */
export default function CategoryError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Category page error:', error);
    }, [error]);

    return (
        <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/50 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900" />

            <div className="relative mx-auto max-w-7xl">
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                    <div className="mb-4 text-6xl">😔</div>
                    <h1 className="mb-2 font-serif text-2xl font-bold text-foreground">
                        Something went wrong
                    </h1>
                    <p className="mb-6 max-w-md text-muted-foreground">
                        We couldn&apos;t load the products. This might be a temporary issue.
                        Please try again.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={reset} variant="default">
                            Try Again
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && error.message && (
                        <details className="mt-8 max-w-xl text-left">
                            <summary className="cursor-pointer text-sm text-muted-foreground">
                                Error details (development only)
                            </summary>
                            <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                                {error.message}
                                {error.digest && `\nDigest: ${error.digest}`}
                            </pre>
                        </details>
                    )}
                </div>
            </div>
        </main>
    );
}

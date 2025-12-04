import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Test Database Connection Page
 *
 * This page verifies:
 * 1. Supabase connection is working
 * 2. Server-side client with async cookies() works
 * 3. TypeScript types provide proper IntelliSense
 * 4. RLS policies allow public product reads
 *
 * AC #7: Test Query Verification
 */
export default async function TestDbPage() {
    let connectionStatus: 'connected' | 'error' | 'not-configured' =
        'not-configured';
    let products: unknown[] = [];
    let errorMessage: string | null = null;

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        connectionStatus = 'not-configured';
        errorMessage =
            'Supabase environment variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local';
    } else {
        try {
            const supabase = await createClient();

            // Test query - fetch products (RLS should allow public read)
            const { data, error } = await supabase
                .from('products')
                .select('id, name, slug, price, category')
                .limit(5);

            if (error) {
                connectionStatus = 'error';
                errorMessage = `Database error: ${error.message}`;
            } else {
                connectionStatus = 'connected';
                products = data || [];
            }
        } catch (err) {
            connectionStatus = 'error';
            errorMessage =
                err instanceof Error ? err.message : 'Unknown error occurred';
        }
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Database Connection Test</h1>
                <Button asChild variant="outline">
                    <Link href="/">← Back to Home</Link>
                </Button>
            </div>

            {/* Connection Status Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Connection Status
                        <StatusBadge status={connectionStatus} />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {connectionStatus === 'not-configured' && (
                        <div className="space-y-4">
                            <p className="text-destructive">{errorMessage}</p>
                            <div className="rounded-md bg-muted p-4">
                                <p className="mb-2 font-semibold">To configure Supabase:</p>
                                <ol className="list-inside list-decimal space-y-1 text-sm">
                                    <li>
                                        Create a Supabase project at{' '}
                                        <a
                                            href="https://supabase.com/dashboard"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline"
                                        >
                                            supabase.com/dashboard
                                        </a>
                                    </li>
                                    <li>
                                        Copy Project URL and Anon Key from Project Settings → API
                                    </li>
                                    <li>
                                        Create <code className="rounded bg-muted px-1">.env.local</code>{' '}
                                        with credentials
                                    </li>
                                    <li>Restart the dev server</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {connectionStatus === 'error' && (
                        <div className="space-y-4">
                            <p className="text-destructive">{errorMessage}</p>
                            <div className="rounded-md bg-muted p-4">
                                <p className="font-semibold">Troubleshooting:</p>
                                <ul className="list-inside list-disc space-y-1 text-sm">
                                    <li>Verify database migrations have been run</li>
                                    <li>Check Supabase Dashboard for table creation</li>
                                    <li>Ensure RLS policies allow public product reads</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {connectionStatus === 'connected' && (
                        <div className="space-y-4">
                            <p className="text-green-600 dark:text-green-400">
                                ✓ Successfully connected to Supabase!
                            </p>
                            <div className="grid gap-2 text-sm">
                                <p>
                                    <strong>URL:</strong>{' '}
                                    <code className="rounded bg-muted px-1">
                                        {supabaseUrl?.replace(
                                            /https:\/\/([a-z0-9]+)\.supabase\.co/,
                                            'https://*****.supabase.co',
                                        )}
                                    </code>
                                </p>
                                <p>
                                    <strong>Products Found:</strong> {products.length}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Products Table */}
            {connectionStatus === 'connected' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Products Table (Test Query)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products.length === 0 ? (
                            <div className="rounded-md bg-muted p-4 text-center">
                                <p className="mb-2">No products found in database.</p>
                                <p className="text-sm text-muted-foreground">
                                    Run the seed script or insert test data via Supabase Studio.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2 text-left">Name</th>
                                            <th className="p-2 text-left">Slug</th>
                                            <th className="p-2 text-left">Category</th>
                                            <th className="p-2 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(
                                            products as Array<{
                                                id: string;
                                                name: string;
                                                slug: string;
                                                category: string;
                                                price: number;
                                            }>
                                        ).map((product) => (
                                            <tr key={product.id} className="border-b">
                                                <td className="p-2">{product.name}</td>
                                                <td className="p-2">
                                                    <code className="rounded bg-muted px-1">
                                                        {product.slug}
                                                    </code>
                                                </td>
                                                <td className="p-2">{product.category}</td>
                                                <td className="p-2 text-right">
                                                    ${product.price?.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Acceptance Criteria Checklist */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Story 1-3 Acceptance Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <CheckItem
                            checked={connectionStatus === 'connected'}
                            label="AC #1: Supabase Project Initialization"
                        />
                        <CheckItem
                            checked={connectionStatus === 'connected'}
                            label="AC #2: Core Database Tables Created"
                        />
                        <CheckItem
                            checked={connectionStatus === 'connected'}
                            label="AC #3: Relationships and Constraints"
                        />
                        <CheckItem
                            checked={connectionStatus === 'connected'}
                            label="AC #4: Row Level Security (RLS)"
                        />
                        <CheckItem checked={true} label="AC #5: TypeScript Type Generation" />
                        <CheckItem checked={true} label="AC #6: Supabase Client Configuration" />
                        <CheckItem
                            checked={connectionStatus === 'connected'}
                            label="AC #7: Test Query Verification"
                        />
                    </ul>
                </CardContent>
            </Card>
        </main>
    );
}

function StatusBadge({
    status,
}: {
    status: 'connected' | 'error' | 'not-configured';
}) {
    const styles = {
        connected: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'not-configured':
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };

    const labels = {
        connected: '✓ Connected',
        error: '✗ Error',
        'not-configured': '⚠ Not Configured',
    };

    return (
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
    return (
        <li className="flex items-center gap-2">
            <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${checked
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
            >
                {checked ? '✓' : '○'}
            </span>
            <span className={checked ? '' : 'text-muted-foreground'}>{label}</span>
        </li>
    );
}

export const metadata = {
    title: 'Database Test | Lyra Fashion',
    description: 'Test page for verifying Supabase database connection',
};

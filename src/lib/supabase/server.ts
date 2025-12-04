import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client for Server Components.
 *
 * IMPORTANT: This function is async due to Next.js 15's async cookies() API.
 * Always use: `const supabase = await createClient()`
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function ProductsPage() {
 *   const supabase = await createClient();
 *   const { data: products } = await supabase.from('products').select('*');
 *   return <div>{products?.map(p => <p key={p.id}>{p.name}</p>)}</div>;
 * }
 * ```
 */
export async function createClient() {
    const cookieStore = await cookies(); // Next.js 15: cookies() is async!

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options),
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        },
    );
}

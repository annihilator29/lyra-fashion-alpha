import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Creates a Supabase client for Client Components.
 *
 * Use this in components with 'use client' directive.
 *
 * @example
 * ```tsx
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 * import { useEffect, useState } from 'react';
 *
 * export function ProductList() {
 *   const [products, setProducts] = useState([]);
 *   const supabase = createClient();
 *
 *   useEffect(() => {
 *     supabase.from('products').select('*').then(({ data }) => {
 *       if (data) setProducts(data);
 *     });
 *   }, []);
 *
 *   return <div>{products.map(p => <p key={p.id}>{p.name}</p>)}</div>;
 * }
 * ```
 */
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
}

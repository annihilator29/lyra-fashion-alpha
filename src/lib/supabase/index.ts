/**
 * Supabase Client Entry Point
 * Exports both client and server Supabase instances
 */

export { createBrowserClient } from './client';
export { createClient as createSupabaseClient } from './server';

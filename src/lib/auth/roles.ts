import { createClient } from '@/lib/supabase/server';

/**
 * Check if the current user has admin role
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // Check role in user metadata
  const role = user.user_metadata?.role;
  return role === 'admin';
}

/**
 * Get current user's role
 * @returns Promise<string> - User's role ('admin' | 'user' | null)
 */
export async function getUserRole(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return user.user_metadata?.role || 'user';
}

/**
 * Require admin role - throws error if not admin
 * Use this in server actions/API routes
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

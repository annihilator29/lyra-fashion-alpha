import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type UserRole = 'customer' | 'admin' | 'super_admin';

/**
 * Check if the current user has admin or super_admin role
 * @returns Promise<boolean> - True if user is admin or super_admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const role = user.user_metadata?.role as UserRole;
  return role === 'admin' || role === 'super_admin';
}

/**
 * Get current user's role
 * @returns Promise<UserRole | null> - User's role or null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (user.user_metadata?.role as UserRole) || 'customer';
}

/**
 * Require admin role - redirects to login if not authenticated, shows access denied if not admin
 * Use this in server components
 * @param redirectPath - Path to redirect unauthenticated users (default: '/login')
 */
export async function requireAdmin(redirectPath: string = '/login'): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectPath);
    return;
  }

  const role = user.user_metadata?.role as UserRole;
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/access-denied');
    return;
  }
}

/**
 * Check if user has a specific role
 * @param requiredRole - The role to check for
 * @returns Promise<boolean> - True if user has the required role or higher
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const role = await getUserRole();

  if (!role) return false;

  const roleHierarchy: Record<UserRole, number> = {
    customer: 1,
    admin: 2,
    super_admin: 3,
  };

  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}

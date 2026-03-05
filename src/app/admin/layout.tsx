/**
 * Admin Layout
 * Story 7.1a: Admin Dashboard - Foundation
 * AC1: Protected Admin Area, AC2: Admin Layout & Navigation
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRole, UserRole } from '@/lib/auth/roles';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminProvider } from '@/components/admin/admin-provider';
import { QueryProvider } from '@/components/providers/query-provider';

export const metadata = {
  title: 'Admin Dashboard - Lyra Fashion',
  description: 'Admin dashboard for managing Lyra Fashion store',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Check admin role
  const role = await getUserRole();
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/access-denied');
  }

  // Fetch customer profile for sidebar info
  const { data: customer } = await supabase
    .from('customers')
    .select('id, email, name, avatar_url, role')
    .eq('id', user.id)
    .single();

  const adminUser = {
    id: user.id,
    email: user.email || customer?.email || '',
    name: customer?.name || null,
    avatar_url: customer?.avatar_url || null,
    role: (customer?.role || role || 'customer') as UserRole,
  };

  return (
    <AdminProvider user={adminUser}>
      <QueryProvider>
        <div className="min-h-screen bg-slate-50">
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
              <AdminHeader />
              <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </div>
      </QueryProvider>
    </AdminProvider>
  );
}

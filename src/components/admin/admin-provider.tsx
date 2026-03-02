/**
 * Admin Provider
 * Story 7.1a: Admin Dashboard - Foundation
 * Provides admin context for client components
 */

'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '@/lib/auth/roles';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
}

interface AdminContextType {
  user: AdminUser;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AdminUser;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AdminContext.Provider
      value={{
        user,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

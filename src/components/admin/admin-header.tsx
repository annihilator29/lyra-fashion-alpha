/**
 * Admin Header Component
 * Story 7.1a: Admin Dashboard - Foundation
 * AC2: Admin Layout & Navigation
 */

'use client';

import { Menu, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from './admin-provider';

export function AdminHeader() {
  const { user, toggleSidebar } = useAdmin();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8" data-testid="admin-header">
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
          data-testid="mobile-menu-toggle"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        {/* Breadcrumb / Current Page Title */}
        <div className="hidden sm:flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">Lyra Fashion Admin</span>
        </div>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || user.email}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-primary">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

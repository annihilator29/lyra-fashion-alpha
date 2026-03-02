/**
 * Admin Sidebar Component
 * Story 7.1a: Admin Dashboard - Foundation
 * AC2: Admin Layout & Navigation
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Factory,
  FileText,
  Box,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdmin } from './admin-provider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: <Package className="h-5 w-5" />,
  },
  {
    label: 'Inventory',
    href: '/admin/inventory',
    icon: <Box className="h-5 w-5" />,
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Reviews',
    href: '/admin/reviews',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    label: 'Production',
    href: '/admin/production',
    icon: <Factory className="h-5 w-5" />,
  },
  {
    label: 'Blog',
    href: '/admin/blog',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Returns',
    href: '/admin/returns',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function AdminSidebar() {
  const { user, sidebarOpen, setSidebarOpen } = useAdmin();
  const pathname = usePathname();

  const handleLogout = async () => {
    const response = await fetch('/api/auth/signout', { method: 'POST' });
    if (response.ok) {
      window.location.href = '/login';
    }
  };

  const handleClose = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-[250px] bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        data-testid="admin-sidebar"
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto h-[calc(100%-180px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4 bg-slate-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.name || user.email}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}

/**
 * Admin Types
 * Story 7.1a: Admin Dashboard - Foundation
 */

import { ReactNode } from 'react';

export type AdminRole = 'customer' | 'admin' | 'super_admin';

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  requiredRole?: AdminRole;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  isLoading?: boolean;
}

export interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

export interface QuickLinksGridProps {
  links: QuickLink[];
}

export interface DashboardMetrics {
  todaysRevenue: number;
  newOrders: number;
  processingOrders: number;
  shippedOrders: number;
  newSignups: number;
  activeUsers: number;
}

export interface AdminSidebarProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    role: AdminRole;
  };
  activeRoute: string;
}

export interface AdminHeaderProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    role: AdminRole;
  };
  onMenuToggle: () => void;
}

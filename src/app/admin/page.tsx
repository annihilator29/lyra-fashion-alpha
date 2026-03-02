/**
 * Admin Dashboard Page
 * Story 7.1a: Admin Dashboard - Foundation
 * Main dashboard displaying key metrics and quick navigation
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserRole, isAdmin } from '@/lib/auth/roles';
import { getDashboardMetrics } from '@/app/admin/actions';
import { MetricCard } from '@/components/admin/metric-card';
import { QuickLinksGrid } from '@/components/admin/quick-links-grid';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  Users,
  UserPlus,
  Store,
  Factory,
  FileText,
  Box,
  Settings,
  Shield,
} from 'lucide-react';

// Loading skeleton for dashboard metrics
function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-[120px]" />
      ))}
    </div>
  );
}

// Metrics section component
async function DashboardMetrics() {
  const metrics = await getDashboardMetrics();

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Today's Revenue"
        value={formatCurrency(metrics.todaysRevenue)}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <MetricCard
        title="New Orders"
        value={metrics.newOrders}
        subtitle="Pending orders today"
        icon={<ShoppingCart className="h-5 w-5" />}
      />
      <MetricCard
        title="Processing Orders"
        value={metrics.processingOrders}
        subtitle="In production"
        icon={<Factory className="h-5 w-5" />}
      />
      <MetricCard
        title="Shipped Orders"
        value={metrics.shippedOrders}
        subtitle="Out for delivery"
        icon={<Truck className="h-5 w-5" />}
      />
      <MetricCard
        title="New Signups"
        value={metrics.newSignups}
        subtitle="Today"
        icon={<UserPlus className="h-5 w-5" />}
      />
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers}
        subtitle="Last 30 days"
        icon={<Users className="h-5 w-5" />}
      />
    </div>
  );
}

// Quick links configuration
const quickLinks = [
  {
    title: 'Products',
    description: 'Manage product catalog and variants',
    href: '/admin/products',
    icon: <Store className="h-8 w-8" />,
  },
  {
    title: 'Inventory',
    description: 'Track stock levels and restocking',
    href: '/admin/inventory',
    icon: <Box className="h-8 w-8" />,
  },
  {
    title: 'Orders',
    description: 'Process and track all orders',
    href: '/admin/orders',
    icon: <Package className="h-8 w-8" />,
  },
  {
    title: 'Customers',
    description: 'View and manage customer accounts',
    href: '/admin/customers',
    icon: <Users className="h-8 w-8" />,
  },
  {
    title: 'Factory Stories',
    description: 'Edit craftsmanship content',
    href: '/admin/factory-stories',
    icon: <Factory className="h-8 w-8" />,
  },
  {
    title: 'Blog',
    description: 'Manage blog posts and articles',
    href: '/admin/blog',
    icon: <FileText className="h-8 w-8" />,
  },
];

export default async function AdminDashboardPage() {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/login?redirect=/admin');
  }

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
        <Suspense fallback={<MetricsSkeleton />}>
          <DashboardMetrics />
        </Suspense>
      </section>

      {/* Quick Navigation */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <QuickLinksGrid links={quickLinks} />
      </section>

      {/* Recent Activity Placeholder */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>Recent activity feed coming in Story 7.1c (Real-time Updates)</p>
        </div>
      </section>
    </div>
  );
}

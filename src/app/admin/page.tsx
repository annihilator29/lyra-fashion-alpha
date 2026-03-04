/**
 * Admin Dashboard Page
 * Story 7.1a + 7.1b + 7.1c: Admin Dashboard - Foundation + Data Visualization + Real-Time Features
 * Main dashboard displaying key metrics, quick navigation, charts, and real-time recent orders
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/roles';
import { getDashboardMetrics, getRecentOrders } from '@/app/admin/actions';
import { getDashboardChartData } from '@/app/admin/analytics-actions';
import { MetricCard } from '@/components/admin/metric-card';
import { QuickLinksGrid } from '@/components/admin/quick-links-grid';
import { ChartsSection } from '@/components/admin/charts-section';
import { RecentOrdersSection } from '@/components/admin/recent-orders-section';
import { DashboardAlertsClient } from '@/components/admin/dashboard-alerts-client';
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

// Loading skeleton for charts
function ChartsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ))}
    </div>
  );
}

// Loading skeleton for alerts
function AlertsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} className="h-[200px]" />
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

// Charts section — server component that loads data then passes to client wrapper
async function DashboardCharts() {
  const { salesTrends, topProducts, customerGrowth, orderStatus } =
    await getDashboardChartData('daily');

  return (
    <ChartsSection
      initialSalesTrends={salesTrends}
      initialTopProducts={topProducts}
      initialCustomerGrowth={customerGrowth}
      initialOrderStatus={orderStatus}
    />
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

  // Fetch initial recent orders for real-time section
  const { orders: initialOrders } = await getRecentOrders(10);

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

      {/* Data Visualization Charts */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Analytics</h2>
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardCharts />
        </Suspense>
      </section>

      {/* Alerts & Notifications */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Alerts &amp; Notifications</h2>
        <Suspense fallback={<AlertsSkeleton />}>
          <DashboardAlertsClient />
        </Suspense>
      </section>

      {/* Recent Orders with Real-Time Updates */}
      <section>
        <RecentOrdersSection initialOrders={initialOrders} />
      </section>

      {/* Quick Navigation */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
        <QuickLinksGrid links={quickLinks} />
      </section>
    </div>
  );
}

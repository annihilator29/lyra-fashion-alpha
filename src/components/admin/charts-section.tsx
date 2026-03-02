'use client';

/**
 * ChartsSection — Client Wrapper for Admin Dashboard Charts
 * Story 7.1b: Admin Dashboard - Data Visualization
 * Handles time range state and renders all 4 chart cards client-side
 */

import { useState, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TimeRange, SalesTrendData, TopProductData, CustomerGrowthData, OrderStatusData } from '@/app/admin/analytics-actions';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';

// Dynamically import chart components to keep initial bundle small
const RevenueChart = dynamic(() => import('@/components/admin/revenue-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
});

const TopProductsChart = dynamic(() => import('@/components/admin/top-products-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
});

const CustomerGrowthChart = dynamic(() => import('@/components/admin/customer-growth-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
});

const OrderStatusChart = dynamic(() => import('@/components/admin/order-status-chart'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  ssr: false,
});

interface ChartsSectionProps {
  initialSalesTrends: SalesTrendData[];
  initialTopProducts: TopProductData[];
  initialCustomerGrowth: CustomerGrowthData[];
  initialOrderStatus: OrderStatusData[];
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

// Error boundary for chart loading failures
function ChartErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
      {children}
    </Suspense>
  );
}

export function ChartsSection({
  initialSalesTrends,
  initialTopProducts,
  initialCustomerGrowth,
  initialOrderStatus,
}: ChartsSectionProps) {
  const router = useRouter();

  const [salesTimeRange, setSalesTimeRange] = useState<TimeRange>('daily');
  const [customerTimeRange, setCustomerTimeRange] = useState<TimeRange>('daily');
  
  // Debounced handlers for time range changes (AC5: 300ms debounce)
  const debouncedSetSalesTimeRange = useDebounce(
    useCallback((range: TimeRange) => {
      setSalesTimeRange(range);
    }, []),
    300
  );
  
  const debouncedSetCustomerTimeRange = useDebounce(
    useCallback((range: TimeRange) => {
      setCustomerTimeRange(range);
    }, []),
    300
  );

  return (
    <div
      className="grid gap-6 lg:grid-cols-2"
      data-testid="charts-grid"
    >
      {/* AC1: Revenue / Sales Trends */}
      <ChartCard title="Sales Trends">
        <ChartErrorBoundary>
          <RevenueChart
            data={initialSalesTrends}
            timeRange={salesTimeRange}
            onTimeRangeChange={debouncedSetSalesTimeRange}
          />
        </ChartErrorBoundary>
      </ChartCard>

      {/* AC2: Top Products */}
      <ChartCard title="Top Products (Last 30 Days)">
        <ChartErrorBoundary>
          <TopProductsChart
            data={initialTopProducts}
            onViewAll={() => router.push('/admin/products')}
          />
        </ChartErrorBoundary>
      </ChartCard>

      {/* AC3: Customer Growth */}
      <ChartCard title="Customer Growth">
        <ChartErrorBoundary>
          <CustomerGrowthChart
            data={initialCustomerGrowth}
            timeRange={customerTimeRange}
            onTimeRangeChange={debouncedSetCustomerTimeRange}
          />
        </ChartErrorBoundary>
      </ChartCard>

      {/* AC4: Order Status Distribution */}
      <ChartCard title="Order Status (Last 30 Days)">
        <ChartErrorBoundary>
          <OrderStatusChart data={initialOrderStatus} />
        </ChartErrorBoundary>
      </ChartCard>
    </div>
  );
}

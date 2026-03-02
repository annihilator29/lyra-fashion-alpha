'use client';

/**
 * TopProductsChart — AC2
 * Story 7.1b: Admin Dashboard - Data Visualization
 * Horizontal bar chart showing top 10 products by revenue
 */

import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TopProductData } from '@/app/admin/analytics-actions';

interface TopProductsChartProps {
  data: TopProductData[];
  onViewAll: () => void;
  isLoading?: boolean;
}

function truncateName(name: string, maxLen = 20): string {
  return name.length > maxLen ? `${name.slice(0, maxLen)}...` : name;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as TopProductData;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{item?.name}</p>
      <p className="text-primary font-semibold">{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

// Color palette for bars
const BAR_COLORS = [
  'hsl(var(--primary))',
  'hsl(207 90% 54%)',
  'hsl(174 72% 43%)',
  'hsl(263 70% 58%)',
  'hsl(31 90% 58%)',
  'hsl(349 89% 60%)',
  'hsl(199 89% 48%)',
  'hsl(145 63% 42%)',
  'hsl(45 93% 47%)',
  'hsl(280 65% 55%)',
];

function TopProductsChart({ data, onViewAll, isLoading = false }: TopProductsChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (data.length === 0) {
    return (
      <div
        className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed gap-2"
        data-testid="top-products-empty"
      >
        <p className="text-sm text-muted-foreground">No delivered orders yet</p>
        <p className="text-xs text-muted-foreground">Data appears once orders are delivered</p>
      </div>
    );
  }

  const chartData = data.slice(0, 10).map((p) => ({
    ...p,
    shortName: truncateName(p.name),
  }));

  return (
    <div data-testid="top-products-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
          <XAxis
            type="number"
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" barSize={20} animationDuration={300} radius={[0, 3, 3, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex justify-end">
        <button
          onClick={onViewAll}
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          View All Products →
        </button>
      </div>
    </div>
  );
}

export default memo(TopProductsChart);

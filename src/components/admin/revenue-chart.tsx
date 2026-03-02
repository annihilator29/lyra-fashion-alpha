'use client';

/**
 * RevenueChart — AC1
 * Story 7.1b: Admin Dashboard - Data Visualization
 * Area chart showing sales trends with daily/weekly/monthly toggle
 */

import { memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { SalesTrendData, TimeRange } from '@/app/admin/analytics-actions';

interface RevenueChartProps {
  data: SalesTrendData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  isLoading?: boolean;
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function formatXAxisDate(date: string, timeRange: TimeRange): string {
  const d = new Date(date);
  if (timeRange === 'daily') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (timeRange === 'weekly') {
    return `W${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-primary font-semibold">{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

function RevenueChart({ data, timeRange, onTimeRangeChange, isLoading = false }: RevenueChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (data.length < 2) {
    return (
      <div
        className="flex h-[300px] items-center justify-center rounded-lg border border-dashed"
        data-testid="revenue-chart-empty"
      >
        <p className="text-sm text-muted-foreground">Need more data to display trends</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatXAxisDate(d.date, timeRange),
  }));

  return (
    <div data-testid="revenue-chart">
      {/* Toggle buttons */}
      <div className="flex gap-1 mb-4">
        {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {TIME_RANGE_LABELS[range]}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#revenueGradient)"
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(RevenueChart);

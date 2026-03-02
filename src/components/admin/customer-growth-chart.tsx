'use client';

/**
 * CustomerGrowthChart — AC3
 * Story 7.1b: Admin Dashboard - Data Visualization
 * Dual-line chart: new signups (solid) + active users (dashed)
 */

import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerGrowthData, TimeRange } from '@/app/admin/analytics-actions';

interface CustomerGrowthChartProps {
  data: CustomerGrowthData[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  isLoading?: boolean;
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

function formatXAxisDate(date: string, timeRange: TimeRange): string {
  const d = new Date(date);
  if (timeRange === 'daily') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (timeRange === 'weekly') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function CustomerGrowthChart({
  data,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
}: CustomerGrowthChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (data.length === 0) {
    return (
      <div
        className="flex h-[300px] items-center justify-center rounded-lg border border-dashed"
        data-testid="customer-growth-empty"
      >
        <p className="text-sm text-muted-foreground">No customer data available</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatXAxisDate(d.date, timeRange),
  }));

  return (
    <div data-testid="customer-growth-chart">
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
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            formatter={(value) =>
              value === 'newSignups' ? 'New Signups' : 'Active Users (Trailing 30d)'
            }
          />
          <Line
            type="monotone"
            dataKey="newSignups"
            name="newSignups"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
          <Line
            type="monotone"
            dataKey="activeUsers"
            name="activeUsers"
            stroke="hsl(207 90% 54%)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(CustomerGrowthChart);

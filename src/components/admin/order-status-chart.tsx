'use client';

/**
 * OrderStatusChart — AC4
 * Story 7.1b: Admin Dashboard - Data Visualization
 * Donut pie chart showing order status distribution with legend
 */

import { memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusData } from '@/app/admin/analytics-actions';
import { ORDER_STATUS_COLORS, STATUS_LABELS } from '@/lib/constants/status-colors';

interface OrderStatusChartProps {
  data: OrderStatusData[];
  isLoading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as OrderStatusData;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm">
      <p className="font-medium mb-1">
        {STATUS_LABELS[item?.status ?? 'pending'] ?? item?.status}
      </p>
      <p className="text-muted-foreground">
        {item?.count} orders ({item?.percentage}%)
      </p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend({ payload }: any) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map(
        (
          entry: { color: string; payload: OrderStatusData },
          i: number
        ) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {STATUS_LABELS[entry.payload.status] ?? entry.payload.status} (
              {entry.payload.count})
            </span>
          </div>
        )
      )}
    </div>
  );
}

// Center label renders total count inside the donut hole via SVG
function renderCenterLabel(total: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function CenterLabel(props: any) {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    return (
      <>
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          style={{ fontSize: '1.5rem', fontWeight: 700 }}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: '0.7rem' }}
        >
          orders
        </text>
      </>
    );
  };
}

function OrderStatusChart({ data, isLoading = false }: OrderStatusChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (data.length === 0) {
    return (
      <div
        className="flex h-[300px] items-center justify-center rounded-lg border border-dashed"
        data-testid="order-status-empty"
      >
        <p className="text-sm text-muted-foreground">No orders in last 30 days</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div data-testid="order-status-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            animationDuration={300}
            label={renderCenterLabel(total)}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={ORDER_STATUS_COLORS[entry.status] ?? '#9CA3AF'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(OrderStatusChart);

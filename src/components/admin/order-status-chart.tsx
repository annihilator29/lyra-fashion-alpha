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
import { ORDER_STATUS_COLORS } from '@/lib/constants/status-colors';
import { STATUS_LABELS } from '@/lib/orders/status-transitions';

interface OrderStatusChartProps {
  data: OrderStatusData[];
  isLoading?: boolean;
}

interface TooltipPayloadItem {
  payload: OrderStatusData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="rounded-lg border bg-popover p-3 shadow-md text-sm">
      <p className="font-medium mb-1">
        {(STATUS_LABELS[item?.status as keyof typeof STATUS_LABELS] ?? item?.status)}
      </p>
      <p className="text-muted-foreground">
        {item?.count} orders ({item?.percentage}%)
      </p>
    </div>
  );
}

interface LegendEntry {
  color: string;
  payload: OrderStatusData;
}

interface CustomLegendProps {
  payload?: LegendEntry[];
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry: LegendEntry, i: number) => (
        <div key={i} className="flex items-center gap-1 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {STATUS_LABELS[entry.payload.status as keyof typeof STATUS_LABELS] ?? entry.payload.status} (
            {entry.payload.count})
          </span>
        </div>
      ))}
    </div>
  );
}

// Render percentage labels on pie segments - using Recharts PieLabelRenderProps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderPieLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  
  // Validate all required properties are present
  if (cx == null || cy == null || midAngle == null || innerRadius == null || outerRadius == null || percent == null) {
    return null;
  }
  
  // Only show label if segment is at least 5%
  if (percent < 0.05) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
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
            label={renderPieLabel}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.status}`}
                fill={ORDER_STATUS_COLORS[entry.status as keyof typeof ORDER_STATUS_COLORS] ?? '#9CA3AF'}
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

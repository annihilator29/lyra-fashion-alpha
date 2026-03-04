/**
 * Metric Card Component
 * Story 7.1a: Admin Dashboard - Foundation
 * AC3: Key Metrics Display
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  isUpdating?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  isLoading,
  isUpdating,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('h-[120px]', className)} data-testid="metric-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" data-testid="metric-skeleton" />
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">{value}</div>
            {isUpdating ? (
              <p className="text-xs text-blue-500 animate-pulse" data-testid="updating-indicator">
                Updating...
              </p>
            ) : subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  isLoading,
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
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

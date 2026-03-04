/**
 * Dashboard Alerts Client Component
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 * Client wrapper for alerts with realtime updates
 */

'use client';

import { useRealtimeAlerts } from '@/hooks/use-realtime-alerts';
import { useDismissedAlerts } from '@/hooks/use-dismissed-alerts';
import { AlertsSection } from '@/components/admin/alerts-section';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardAlertsClient() {
  const { alerts, isLoading, error, recentlyUpdatedAlertIds } = useRealtimeAlerts();
  const { dismissedIds, dismiss, dismissAllToday, dismissForToday } = useDismissedAlerts();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Failed to load alerts: {error}
      </div>
    );
  }

  return (
    <AlertsSection
      alerts={alerts}
      dismissedAlertIds={dismissedIds}
      onDismiss={dismiss}
      onDismissForToday={dismissForToday}
      onDismissAllToday={dismissAllToday}
      recentlyUpdatedAlertIds={recentlyUpdatedAlertIds}
    />
  );
}

/**
 * Alerts Section Component
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 * AC5: Alert collection display with priority ordering and dismissal
 */

'use client';

import { useMemo, useState } from 'react';
import { AlertCard, AlertType, AlertItem, AlertPriority } from './alert-card';
import { AlertsEmptyState } from './alerts-empty-state';
import { sortAlerts } from '@/lib/alerts/priority';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Alert {
  id: string;
  type: AlertType;
  count: number;
  priority: AlertPriority;
  items: AlertItem[];
  actionLink: string;
  actionLabel: string;
  title?: string;
}

export interface AlertsSectionProps {
  alerts: Alert[];
  dismissedAlertIds: string[];
  onDismiss: (alertId: string) => void;
  onDismissForToday?: (alertId: string) => void; // AC5: Per-alert daily dismissal
  onDismissAllToday?: () => void;
  recentlyUpdatedAlertIds?: string[]; // AC6: For pulse effect
}

const MAX_VISIBLE_ALERTS = 4;

export function AlertsSection({
  alerts,
  dismissedAlertIds,
  onDismiss,
  onDismissForToday,
  onDismissAllToday,
  recentlyUpdatedAlertIds = [],
}: AlertsSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // Filter out dismissed alerts and sort by priority
  const visibleAlerts = useMemo(() => {
    const filtered = alerts.filter(
      (alert) => !dismissedAlertIds.includes(alert.id)
    );

    if (filtered.length === 0) return [];

    return sortAlerts(filtered);
  }, [alerts, dismissedAlertIds]);

  // Determine which alerts to show (max 4 unless expanded)
  const displayedAlerts = showAll 
    ? visibleAlerts 
    : visibleAlerts.slice(0, MAX_VISIBLE_ALERTS);
  
  const hiddenCount = visibleAlerts.length - MAX_VISIBLE_ALERTS;

  // Handle dismiss all
  const handleDismissAll = () => {
    if (onDismissAllToday) {
      onDismissAllToday();
    } else {
      // Dismiss all visible alerts
      visibleAlerts.forEach((alert) => onDismiss(alert.id));
    }
  };

  // No alerts - show empty state
  if (visibleAlerts.length === 0) {
    return <AlertsEmptyState />;
  }

  return (
    <section data-testid="alerts-section" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Alerts ({visibleAlerts.length})
        </h2>
        {onDismissAllToday && visibleAlerts.length > 1 && (
          <button
            onClick={handleDismissAll}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Dismiss all for today
          </button>
        )}
      </div>

      {/* Alert grid - responsive: 2 columns desktop, 1 column mobile */}
      <div className="grid gap-4 md:grid-cols-2">
        {displayedAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            type={alert.type}
            count={alert.count}
            priority={alert.priority}
            items={alert.items}
            onDismiss={() => onDismiss(alert.id)}
            onDismissForToday={
              onDismissForToday ? () => onDismissForToday(alert.id) : undefined
            }
            actionLink={alert.actionLink}
            actionLabel={alert.actionLabel}
            title={alert.title}
            isRecentlyUpdated={recentlyUpdatedAlertIds.includes(alert.id)}
          />
        ))}
      </div>

      {/* AC5: Show "+N more" button if more than 4 alerts */}
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          data-testid="show-more-alerts"
        >
          <ChevronDown className="h-4 w-4" />
          +{hiddenCount} more alert{hiddenCount === 1 ? '' : 's'}
        </button>
      )}

      {/* Show collapse button when expanded */}
      {showAll && visibleAlerts.length > MAX_VISIBLE_ALERTS && (
        <button
          onClick={() => setShowAll(false)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          data-testid="show-less-alerts"
        >
          <ChevronUp className="h-4 w-4" />
          Show less
        </button>
      )}
    </section>
  );
}

/**
 * Alerts Empty State Component
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 * AC5: Empty state when no alerts require attention
 */

'use client';

import { CheckCircle } from 'lucide-react';

export function AlertsEmptyState() {
  return (
    <div
      data-testid="alerts-empty-state"
      className="flex flex-col items-center justify-center rounded-lg border border-green-200 bg-green-50 p-8"
    >
      <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
      <h3 className="text-lg font-semibold text-green-800">All caught up!</h3>
      <p className="text-green-600">No items requiring attention.</p>
    </div>
  );
}

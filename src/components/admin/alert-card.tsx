/**
 * Alert Card Component
 * Story 7.1d: Admin Dashboard - Alerts & Notifications
 * AC1-4: Alert display with priority-based styling
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AlertType =
  | 'low-inventory'
  | 'pending-returns'
  | 'support-tickets'
  | 'failed-payments';

export type AlertPriority = 'high' | 'medium';

export interface AlertItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
}

export interface AlertCardProps {
  type: AlertType;
  count: number;
  priority: AlertPriority;
  items: AlertItem[];
  onDismiss: () => void;
  onDismissForToday?: () => void; // AC5: Per-alert daily dismissal
  actionLink: string;
  actionLabel: string;
  icon?: React.ReactNode;
  title?: string;
  isRecentlyUpdated?: boolean; // AC6: Pulse effect on update
}

const PRIORITY_STYLES = {
  high: {
    border: 'border-red-500',
    background: 'bg-red-50',
    icon: 'text-red-500',
    badge: 'bg-red-100 text-red-800',
    iconComponent: AlertTriangle,
  },
  medium: {
    border: 'border-yellow-500',
    background: 'bg-yellow-50',
    icon: 'text-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800',
    iconComponent: AlertCircle,
  },
};

const DEFAULT_TITLES: Record<AlertType, string> = {
  'low-inventory': 'Low Inventory',
  'pending-returns': 'Pending Returns',
  'support-tickets': 'Support Tickets',
  'failed-payments': 'Failed Payments',
};

export function AlertCard({
  type,
  count,
  priority,
  items,
  onDismiss,
  onDismissForToday,
  actionLink,
  actionLabel,
  icon,
  title,
  isRecentlyUpdated = false,
}: AlertCardProps) {
  const styles = PRIORITY_STYLES[priority];
  const IconComponent = icon ? undefined : styles.iconComponent;
  const displayTitle = title || DEFAULT_TITLES[type];
  const [showDismissOptions, setShowDismissOptions] = useState(false);

  return (
    <div
      data-testid="alert-card"
      data-alert-type={type}
      data-priority={priority}
      className={cn(
        'relative rounded-lg border-2 p-4 shadow-sm transition-all duration-500',
        styles.border,
        styles.background,
        // AC6: Pulse effect when recently updated
        isRecentlyUpdated && 'ring-4 ring-opacity-50 animate-pulse',
        isRecentlyUpdated && priority === 'high' && 'ring-red-400',
        isRecentlyUpdated && priority === 'medium' && 'ring-yellow-400'
      )}
    >
      {/* Dismiss button with options */}
      <div className="absolute right-2 top-2">
        {onDismissForToday ? (
          <div className="relative">
            <button
              onClick={() => setShowDismissOptions(!showDismissOptions)}
              aria-label="Dismiss alert options"
              data-testid="dismiss-alert-options"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
            {showDismissOptions && (
              <div className="absolute right-0 top-6 z-10 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    onDismiss();
                    setShowDismissOptions(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Dismiss for now
                </button>
                <button
                  onClick={() => {
                    onDismissForToday();
                    setShowDismissOptions(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Don&apos;t show today
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onDismiss}
            aria-label="Dismiss alert"
            data-testid="dismiss-alert"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        {icon || (IconComponent && <IconComponent className={cn('h-5 w-5', styles.icon)} />)}
        <h3 className="text-base font-semibold text-gray-900">{displayTitle}</h3>
        <span
          className={cn(
            'ml-auto rounded-full px-2 py-0.5 text-xs font-medium',
            styles.badge
          )}
        >
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <ul className="mb-3 space-y-2">
          {items.slice(0, 3).map((item) => (
            <li key={item.id} className="text-sm">
              <div className="font-medium text-gray-900">{item.title}</div>
              {item.subtitle && (
                <div className="text-xs text-gray-600">{item.subtitle}</div>
              )}
              {item.meta && (
                <div className="text-xs font-medium text-gray-700">{item.meta}</div>
              )}
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-xs font-medium text-blue-600 hover:text-blue-800">
              +{items.length - 3} more...
            </li>
          )}
        </ul>
      )}

      {/* Action link */}
      <a href={actionLink}>
        <Button variant="outline" size="sm" className="w-full">
          {actionLabel}
        </Button>
      </a>
    </div>
  );
}

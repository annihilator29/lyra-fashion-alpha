/**
 * Activity Timeline Component
 * Story 7.4c: Customer Activity Timeline
 * AC1: Customer Activity Timeline
 *
 * Chronological view of customer activities with:
 * - Date grouping (Today, Yesterday, This Week, etc.)
 * - Activity type filtering
 * - Activity type icons
 * - Infinite scroll / load more
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  Truck,
  CheckCircle2,
  RotateCcw,
  Ticket,
  RefreshCw,
  Mail,
  MapPin,
  PenLine,
  Settings,
  Loader2,
  Filter,
} from 'lucide-react';
import { getCustomerActivityTimeline } from '@/app/admin/customers/activity-actions';

// ============================================================================
// Types
// ============================================================================

type ActivityType =
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_returned'
  | 'ticket_created'
  | 'ticket_status_changed'
  | 'ticket_resolved'
  | 'email_sent'
  | 'address_added'
  | 'address_updated'
  | 'preference_updated';

interface ActivityItem {
  id: string;
  customer_id: string;
  activity_type: ActivityType;
  activity_data: Record<string, unknown> | null;
  created_at: string;
}

interface ActivityTimelineProps {
  customerId: string;
  initialActivities: ActivityItem[];
  initialTotal: number;
}

// ============================================================================
// Activity Type Config
// ============================================================================

interface ActivityConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
}

const ACTIVITY_CONFIG: Record<ActivityType, ActivityConfig> = {
  order_placed: { icon: Package, color: 'text-blue-600 bg-blue-50', label: 'Order Placed' },
  order_shipped: { icon: Truck, color: 'text-indigo-600 bg-indigo-50', label: 'Order Shipped' },
  order_delivered: { icon: CheckCircle2, color: 'text-green-600 bg-green-50', label: 'Order Delivered' },
  order_returned: { icon: RotateCcw, color: 'text-orange-600 bg-orange-50', label: 'Order Returned' },
  ticket_created: { icon: Ticket, color: 'text-purple-600 bg-purple-50', label: 'Ticket Created' },
  ticket_status_changed: { icon: RefreshCw, color: 'text-purple-600 bg-purple-50', label: 'Ticket Status Changed' },
  ticket_resolved: { icon: CheckCircle2, color: 'text-green-600 bg-green-50', label: 'Ticket Resolved' },
  email_sent: { icon: Mail, color: 'text-cyan-600 bg-cyan-50', label: 'Email Sent' },
  address_added: { icon: MapPin, color: 'text-gray-600 bg-gray-50', label: 'Address Added' },
  address_updated: { icon: PenLine, color: 'text-gray-600 bg-gray-50', label: 'Address Updated' },
  preference_updated: { icon: Settings, color: 'text-gray-600 bg-gray-50', label: 'Preference Updated' },
};

const ALL_TYPES: ActivityType[] = [
  'order_placed',
  'order_shipped',
  'order_delivered',
  'order_returned',
  'ticket_created',
  'ticket_status_changed',
  'ticket_resolved',
  'email_sent',
  'address_added',
  'address_updated',
  'preference_updated',
];

// ============================================================================
// Date Grouping
// ============================================================================

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= today) return 'Today';
  if (date >= yesterday) return 'Yesterday';
  if (date >= thisWeekStart) return 'This Week';
  if (date >= lastWeekStart) return 'Last Week';
  if (date >= thisMonthStart) return 'This Month';

  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function groupByDate(activities: ActivityItem[]): Record<string, ActivityItem[]> {
  const groups: Record<string, ActivityItem[]> = {};
  for (const activity of activities) {
    const group = getDateGroup(activity.created_at);
    if (!groups[group]) groups[group] = [];
    groups[group].push(activity);
  }
  return groups;
}

// ============================================================================
// Format Activity Details
// ============================================================================

function formatActivityDetails(activity: ActivityItem): string {
  const data = activity.activity_data;
  if (!data) return '';

  switch (activity.activity_type) {
    case 'order_placed':
      return `Order ${data.order_number ?? ''} — $${(((data.total as number) ?? 0) / 100).toFixed(2)}`;
    case 'order_shipped':
      return `Order ${data.order_number ?? ''}${data.tracking_number ? ` — Tracking: ${data.tracking_number}` : ''}`;
    case 'order_delivered':
      return `Order ${data.order_number ?? ''}`;
    case 'order_returned':
      return `Order ${data.order_number ?? ''}${data.reason ? ` — ${data.reason}` : ''}`;
    case 'ticket_created':
      return (data.subject as string) ?? '';
    case 'ticket_status_changed':
      return `${data.old_status ?? ''} → ${data.new_status ?? ''}`;
    case 'ticket_resolved':
      return (data.subject as string) ?? '';
    case 'email_sent':
      return (data.subject as string) ?? '';
    case 'address_added':
      return (data.address_type as string) ?? '';
    case 'address_updated':
      return '';
    case 'preference_updated':
      return (data.preference_type as string) ?? '';
    default:
      return '';
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

function ActivityIcon({ type }: { type: ActivityType }) {
  const config = ACTIVITY_CONFIG[type];
  const Icon = config.icon;
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

function FilterBar({
  selected,
  onChange,
}: {
  selected: ActivityType[];
  onChange: (types: ActivityType[]) => void;
}) {
  const toggle = (type: ActivityType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Button
        variant={selected.length === 0 ? 'secondary' : 'ghost'}
        size="sm"
        onClick={clearAll}
      >
        All
      </Button>
      {ALL_TYPES.map((type) => {
        const config = ACTIVITY_CONFIG[type];
        const isActive = selected.includes(type);
        return (
          <Button
            key={type}
            variant={isActive ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggle(type)}
          >
            <config.icon className="mr-1 h-3 w-3" />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}

function TimelineItem({ activity }: { activity: ActivityItem }) {
  const config = ACTIVITY_CONFIG[activity.activity_type];
  const details = formatActivityDetails(activity);
  const time = new Date(activity.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="flex gap-3 py-3">
      <ActivityIcon type={activity.activity_type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{config.label}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        {details && (
          <p className="text-sm text-muted-foreground truncate">{details}</p>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 py-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ActivityTimeline({
  customerId,
  initialActivities,
  initialTotal,
}: ActivityTimelineProps) {
  const [activities, setActivities] = React.useState<ActivityItem[]>(initialActivities);
  const [filter, setFilter] = React.useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(initialActivities.length < initialTotal);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  // Refetch when filter changes
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      const result = await getCustomerActivityTimeline(customerId, {
        types: filter.length > 0 ? filter : undefined,
        limit: 50,
        offset: 0,
      });
      if (!cancelled) {
        setActivities(result.activities);
        setHasMore(result.hasMore);
        setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, filter.join(',')]);

  // Infinite scroll observer
  React.useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoading, isLoadingMore, activities.length]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const result = await getCustomerActivityTimeline(customerId, {
      types: filter.length > 0 ? filter : undefined,
      limit: 50,
      offset: activities.length,
    });
    setActivities((prev) => [...prev, ...result.activities]);
    setHasMore(result.hasMore);
    setIsLoadingMore(false);
  };

  const grouped = groupByDate(activities);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <FilterBar selected={filter} onChange={setFilter} />

        {/* Timeline */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No activities found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateGroup, items]) => (
              <div key={dateGroup}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {dateGroup}
                  </Badge>
                </div>
                <div className="border-l-2 border-muted ml-4 pl-4 space-y-0">
                  {items.map((activity) => (
                    <TimelineItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isLoadingMore && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {/* Count */}
        {!isLoading && activities.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Showing {activities.length} of {initialTotal} activities
          </p>
        )}
      </CardContent>
    </Card>
  );
}

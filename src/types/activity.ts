/**
 * Customer Activity Types
 * Story 7.4c: Customer Activity Timeline
 */

export const ACTIVITY_TYPES = [
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
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface ActivityItem {
  id: string;
  customer_id: string;
  activity_type: ActivityType;
  activity_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ActivityFilters {
  types?: ActivityType[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityTimelineResult {
  activities: ActivityItem[];
  total: number;
  hasMore: boolean;
  error?: string;
}

export interface LogActivityResult {
  activity: ActivityItem | null;
  error?: string;
}

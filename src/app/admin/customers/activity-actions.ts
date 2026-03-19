/**
 * Customer Activity Timeline Server Actions
 * Story 7.4c: Customer Activity Timeline
 * AC1: Customer Activity Timeline
 *
 * Server actions for the unified activity timeline:
 * - getCustomerActivityTimeline: Fetch chronological activity for a customer
 * - logActivity: Insert a new activity record
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import type {
  ActivityType,
  ActivityItem,
  ActivityFilters,
  ActivityTimelineResult,
  LogActivityResult,
} from '@/types/activity';

// ============================================================================
// Activity Timeline Fetch (AC1)
// ============================================================================

/**
 * Get chronological activity timeline for a customer
 * Supports filtering by event type, date range, and pagination
 */
export async function getCustomerActivityTimeline(
  customerId: string,
  filters: ActivityFilters = {}
): Promise<ActivityTimelineResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('customer_activities') as any)
      .select('*', { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    // Apply type filter
    if (filters.types?.length) {
      query = query.in('activity_type', filters.types);
    }

    // Apply date range filters
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Apply pagination
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('getCustomerActivityTimeline - Error:', JSON.stringify(error, null, 2));
      return { activities: [], total: 0, hasMore: false, error: error.message };
    }

    const activities: ActivityItem[] = (data ?? []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      customer_id: item.customer_id as string,
      activity_type: item.activity_type as ActivityType,
      activity_data: (item.activity_data as Record<string, unknown>) ?? null,
      created_at: item.created_at as string,
    }));

    const total = count ?? activities.length;

    return {
      activities,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error('getCustomerActivityTimeline - Catch Error:', JSON.stringify(error, null, 2));
    return {
      activities: [],
      total: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : 'Failed to fetch activity timeline',
    };
  }
}

// ============================================================================
// Activity Logging
// ============================================================================

/**
 * Log a new activity for a customer
 * Used by other systems (orders, tickets, email) to record events
 */
export async function logActivity(
  customerId: string,
  activityType: ActivityType,
  activityData: Record<string, unknown> = {}
): Promise<LogActivityResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('customer_activities') as any)
      .insert({
        customer_id: customerId,
        activity_type: activityType,
        activity_data: activityData,
      })
      .select()
      .single();

    if (error) {
      console.error('logActivity - Error:', JSON.stringify(error, null, 2));
      return { activity: null, error: error.message };
    }

    return { activity: data as ActivityItem, error: undefined };
  } catch (error) {
    console.error('logActivity - Catch Error:', JSON.stringify(error, null, 2));
    return {
      activity: null,
      error: error instanceof Error ? error.message : 'Failed to log activity',
    };
  }
}

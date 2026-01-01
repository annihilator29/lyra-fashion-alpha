// Email analytics utilities
// Story 4.5: Email Notifications & Marketing Preferences

import { createClient } from '@/lib/supabase/server';

export interface EmailMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface EmailMetricsByType {
  email_type: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

export interface EmailPerformance {
  emailId: string;
  emailType: string;
  subject: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  status: string;
}

/**
 * Get overall email performance metrics
 */
export async function getOverallEmailMetrics(days: number = 30): Promise<EmailMetrics> {
  const supabase = await createClient();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [sentResult, deliveredResult, openedResult, clickedResult, bouncedResult] = await Promise.all([
    supabase
      .from('sent_emails')
      .select('id', { count: 'exact', head: true })
      .gte('sent_at', startDate),
    supabase
      .from('sent_emails')
      .select('id', { count: 'exact', head: true })
      .gte('sent_at', startDate)
      .eq('status', 'delivered'),
    supabase
      .from('sent_emails')
      .select('id', { count: 'exact', head: true })
      .gte('sent_at', startDate)
      .eq('status', 'opened'),
    supabase
      .from('sent_emails')
      .select('id', { count: 'exact', head: true })
      .gte('sent_at', startDate)
      .eq('status', 'clicked'),
    supabase
      .from('sent_emails')
      .select('id', { count: 'exact', head: true })
      .gte('sent_at', startDate)
      .eq('status', 'bounced'),
  ]);

  const totalSent = sentResult.count || 0;
  const totalDelivered = deliveredResult.count || 0;
  const totalOpened = openedResult.count || 0;
  const totalClicked = clickedResult.count || 0;
  const totalBounced = bouncedResult.count || 0;

  return {
    totalSent,
    totalDelivered,
    totalOpened,
    totalClicked,
    totalBounced,
    deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
    openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
    clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
    bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
  };
}

/**
 * Get email metrics by type
 */
export async function getMetricsByType(days: number = 30): Promise<EmailMetricsByType[]> {
  const supabase = await createClient();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('sent_emails')
    .select('email_type, status')
    .gte('sent_at', startDate);

  if (error) {
    console.error('Error fetching metrics by type:', error);
    return [];
  }

  // Group by email type and calculate metrics
  const typeStats = new Map<string, { sent: number; opened: number; clicked: number }>();

  for (const email of data || []) {
    const type = email.email_type;

    if (!typeStats.has(type)) {
      typeStats.set(type, { sent: 0, opened: 0, clicked: 0 });
    }

    const stats = typeStats.get(type)!;
    stats.sent++;

    if (email.status === 'opened' || email.status === 'clicked') {
      stats.opened++;
    }

    if (email.status === 'clicked') {
      stats.clicked++;
    }
  }

  return Array.from(typeStats.entries()).map(([email_type, stats]) => ({
    email_type,
    sent: stats.sent,
    opened: stats.opened,
    clicked: stats.clicked,
    openRate: stats.sent > 0 ? (stats.opened / stats.sent) * 100 : 0,
    clickRate: stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0,
  }));
}

/**
 * Get recent email performance
 */
export async function getRecentEmailPerformance(
  limit: number = 50,
): Promise<EmailPerformance[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sent_emails')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching email performance:', error);
    return [];
  }

  return (data || []).map((email) => ({
    emailId: email.email_id || email.id,
    emailType: email.email_type,
    subject: email.subject,
    sentAt: email.sent_at,
    deliveredAt: email.delivered_at || undefined,
    openedAt: email.opened_at || undefined,
    clickedAt: email.clicked_at || undefined,
    status: email.status,
  }));
}

/**
 * Get email metrics for a specific user
 */
export async function getUserEmailMetrics(userId: string): Promise<{
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
}> {
  const supabase = await createClient();

  const [sentResult, openedResult, clickedResult] = await Promise.all([
    supabase
      .from('sent_emails')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('sent_emails')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['opened', 'clicked']),
    supabase
      .from('sent_emails')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'clicked'),
  ]);

  const totalSent = sentResult.count || 0;
  const totalOpened = openedResult.count || 0;
  const totalClicked = clickedResult.count || 0;

  return {
    totalSent,
    totalOpened,
    totalClicked,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
  };
}

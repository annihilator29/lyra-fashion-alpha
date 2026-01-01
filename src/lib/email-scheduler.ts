// Marketing email scheduling service
// Story 4.5: Email Notifications & Marketing Preferences
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';

export interface ScheduledEmail {
  id: string;
  name: string;
  email_type: string;
  subject: string;
  template_id?: string;
  template_data: any;
  segment_criteria: any;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduled_for: string;
  sent_at?: string;
  recipient_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledEmailParams {
  name: string;
  email_type: 'newsletter' | 'sales' | 'personalized';
  subject: string;
  template_id?: string;
  template_data?: any;
  segment_criteria?: any;
  scheduled_for: Date;
  created_by?: string;
}

/**
 * Create a scheduled email campaign
 */
export async function createScheduledCampaign(
  params: CreateScheduledEmailParams,
): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = await createClient();

  // Validate segment criteria
  const criteria = params.segment_criteria || {};
  const validSegments = ['order_updates', 'new_products', 'sales', 'blog'];
  const invalidSegments = Object.keys(criteria).filter((key) => !validSegments.includes(key));

  if (invalidSegments.length > 0) {
    return {
      success: false,
      error: `Invalid segment criteria: ${invalidSegments.join(', ')}`,
    };
  }

  // Get recipient count based on segment criteria
  const recipientCount = await getSegmentedRecipientCount(criteria);

  const { data, error } = await supabase
    .from('scheduled_emails')
    .insert({
      name: params.name,
      email_type: params.email_type,
      subject: params.subject,
      template_id: params.template_id,
      template_data: params.template_data || {},
      segment_criteria: criteria,
      status: 'draft',
      scheduled_for: params.scheduled_for.toISOString(),
      recipient_count: recipientCount,
      created_by: params.created_by,
    })
    .select('id')
    .single();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    id: data?.id,
  };
}

/**
 * Launch scheduled campaign (add emails to queue)
 */
export async function launchCampaign(
  campaignId: string,
): Promise<{ success: boolean; error?: string; queuedCount?: number }> {
  const supabase = await createClient();

  // Get campaign details
  const { data: campaign, error: fetchError } = await supabase
    .from('scheduled_emails')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (fetchError || !campaign) {
    return {
      success: false,
      error: 'Campaign not found',
    };
  }

  if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
    return {
      success: false,
      error: 'Campaign can only be launched from draft or scheduled status',
    };
  }

  // Get recipients based on segment criteria
  const recipients = await getSegmentedRecipients(campaign.segment_criteria);

  if (recipients.length === 0) {
    return {
      success: false,
      error: 'No recipients found for this segment',
    };
  }

  // Add recipients to email_queue
  const queueItems = recipients.map((recipient) => ({
    email_type: campaign.email_type,
    recipient_email: recipient.email,
    user_id: recipient.user_id,
    subject: campaign.subject,
    template_id: campaign.template_id,
    template_data: campaign.template_data,
    priority: 5, // Marketing emails get lower priority
    status: 'pending',
    scheduled_for: campaign.scheduled_for,
  }));

  const { error: queueError } = await supabase.from('email_queue').insert(queueItems);

  if (queueError) {
    return {
      success: false,
      error: queueError.message,
    };
  }

  // Update campaign status
  await supabase
    .from('scheduled_emails')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipient_count: recipients.length,
    })
    .eq('id', campaignId);

  return {
    success: true,
    queuedCount: recipients.length,
  };
}

/**
 * Cancel a scheduled campaign
 */
export async function cancelCampaign(
  campaignId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('scheduled_emails')
    .update({ status: 'cancelled' })
    .eq('id', campaignId)
    .in('status', ['draft', 'scheduled']);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * Get scheduled campaigns
 */
export async function getScheduledCampaigns(
  status?: string,
): Promise<{ success: boolean; error?: string; campaigns?: ScheduledEmail[] }> {
  const supabase = await createClient();

  let query = supabase
    .from('scheduled_emails')
    .select('*')
    .order('scheduled_for', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    campaigns: data as ScheduledEmail[],
  };
}

/**
 * Get recipients based on segment criteria
 */
async function getSegmentedRecipients(criteria: any): Promise<
  Array<{ user_id: string; email: string }>
> {
  const supabase = await createClient();

  if (Object.keys(criteria).length === 0) {
    // No criteria - get all customers with email preferences enabled
    const { data } = await supabase
      .from('customers')
      .select('id, email, email_preferences')
      .not('email_preferences', 'is', null);

    return (data || []).map((c) => ({
      user_id: c.id,
      email: c.email,
    }));
  }

  // Build query with criteria
  let hasCriteria = false;
  const criteriaQuery = Object.entries(criteria).map(([key, value]) => {
    if (!value) return '';
    hasCriteria = true;
    return `email_preferences->>'${key}' = 'true'`;
  });

  // If no true values in criteria, return empty
  if (!hasCriteria) {
    return [];
  }

  const { data } = await supabase
    .from('customers')
    .select('id, email')
    .not('email_preferences', 'is', null)
    .or(criteriaQuery.join(', '));

  return (data || []).map((c) => ({
    user_id: c.id,
    email: c.email,
  }));
}

/**
 * Get count of recipients based on segment criteria
 */
async function getSegmentedRecipientCount(criteria: any): Promise<number> {
  const recipients = await getSegmentedRecipients(criteria);
  return recipients.length;
}

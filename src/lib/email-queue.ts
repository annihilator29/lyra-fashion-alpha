// Email queue processor for batch sending
// Story 4.5: Email Notifications & Marketing Preferences
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server';
import {
  sendOrderConfirmation,
  sendShipmentNotification,
  sendDeliveryConfirmation,
  sendNewsletter,
  sendSalesEmail,
  sendPersonalizedRecommendations,
} from '@/lib/email-service';

export interface QueueItem {
  id: string;
  email_type: string;
  recipient_email: string;
  user_id?: string;
  subject: string;
  template_id?: string;
  template_data: any;
  priority: number;
  status: string;
  error_message?: string;
  sent_at?: string;
  retry_count: number;
  max_retries: number;
}

export interface QueueResult {
  processed: number;
  sent: number;
  failed: number;
  errors: string[];
}

/**
 * Process pending emails from the queue
 * @param batchSize Number of emails to process in one batch (default: 50)
 * @returns QueueResult with processing statistics
 */
export async function processEmailQueue(batchSize: number = 50): Promise<QueueResult> {
  const supabase = await createClient();
  const result: QueueResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get pending emails ordered by priority and scheduled time
    const { data: queueItems, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      throw new Error(`Failed to fetch queue items: ${fetchError.message}`);
    }

    if (!queueItems || queueItems.length === 0) {
      return result;
    }

    // Mark all as processing
    const { error: updateError } = await supabase
      .from('email_queue')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .in(
        'id',
        queueItems.map((item) => item.id),
      );

    if (updateError) {
      throw new Error(`Failed to update queue status: ${updateError.message}`);
    }

    // Process each email
    for (const item of queueItems as QueueItem[]) {
      try {
        await sendQueuedEmail(item);
        result.sent++;

        // Update as sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`${item.id}: ${errorMessage}`);

        // Handle retries
        if (item.retry_count < item.max_retries) {
          await supabase
            .from('email_queue')
            .update({
              status: 'pending',
              retry_count: item.retry_count + 1,
              error_message: errorMessage,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id);
        } else {
          // Mark as permanently failed
          await supabase
            .from('email_queue')
            .update({
              status: 'failed',
              error_message: errorMessage,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id);
        }
      }

      result.processed++;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Queue processing error: ${errorMessage}`);
  }

  return result;
}

/**
 * Send a single queued email based on its type
 */
async function sendQueuedEmail(item: QueueItem): Promise<void> {
  switch (item.email_type) {
    case 'newsletter':
      await sendNewsletter(item.recipient_email, {
        customerName: item.template_data.customer_name,
        unsubscribeUrl: item.template_data.unsubscribe_url,
        preferencesUrl: item.template_data.preferences_url,
        featuredArticles: item.template_data.featured_articles,
      });
      break;

    case 'sales':
      await sendSalesEmail(item.recipient_email, {
        customerName: item.template_data.customer_name,
        unsubscribeUrl: item.template_data.unsubscribe_url,
        preferencesUrl: item.template_data.preferences_url,
        discountCode: item.template_data.discount_code,
        discountAmount: item.template_data.discount_amount,
        validUntil: item.template_data.valid_until,
        saleItems: item.template_data.sale_items,
      });
      break;

    case 'personalized':
      await sendPersonalizedRecommendations(item.recipient_email, {
        customerName: item.template_data.customer_name,
        unsubscribeUrl: item.template_data.unsubscribe_url,
        preferencesUrl: item.template_data.preferences_url,
        reasonText: item.template_data.reason_text,
        recommendations: item.template_data.recommendations,
      });
      break;

    case 'order_confirmation':
      await sendOrderConfirmation(item.recipient_email, {
        customer_name: item.template_data.customer_name,
        customer_email: item.template_data.customer_email,
        order_number: item.template_data.order_number,
        total: item.template_data.total,
        created_at: item.template_data.created_at,
        order_items: item.template_data.order_items,
        shipping_address: item.template_data.shipping_address,
      });
      break;

    case 'shipment':
      await sendShipmentNotification(item.recipient_email, {
        customerName: item.template_data.customer_name,
        orderNumber: item.template_data.order_number,
        trackingNumber: item.template_data.tracking_number,
        carrier: item.template_data.carrier,
        trackingUrl: item.template_data.tracking_url,
        estimatedDelivery: item.template_data.estimated_delivery,
        items: item.template_data.items,
      });
      break;

    case 'delivery':
      await sendDeliveryConfirmation(item.recipient_email, {
        customerName: item.template_data.customer_name,
        orderNumber: item.template_data.order_number,
        items: item.template_data.items,
        reviewUrl: item.template_data.review_url,
      });
      break;

    default:
      throw new Error(`Unknown email type: ${item.email_type}`);
  }
}

/**
 * Add email to queue
 */
export async function queueEmail(params: {
  email_type: string;
  recipient_email: string;
  user_id?: string;
  subject: string;
  template_id?: string;
  template_data?: any;
  priority?: number;
  scheduled_for?: Date;
  max_retries?: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('email_queue')
    .insert({
      email_type: params.email_type,
      recipient_email: params.recipient_email,
      user_id: params.user_id,
      subject: params.subject,
      template_id: params.template_id,
      template_data: params.template_data || {},
      priority: params.priority || 5,
      max_retries: params.max_retries || 3,
      scheduled_for: params.scheduled_for?.toISOString() || new Date().toISOString(),
      status: 'pending',
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
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  failed: number;
  sentToday: number;
}> {
  const supabase = await createClient();

  const [pendingResult, processingResult, failedResult, sentResult] = await Promise.all([
    supabase.from('email_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('email_queue').select('id', { count: 'exact', head: true }).eq('status', 'processing'),
    supabase.from('email_queue').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase
      .from('email_queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return {
    pending: pendingResult.count || 0,
    processing: processingResult.count || 0,
    failed: failedResult.count || 0,
    sentToday: sentResult.count || 0,
  };
}

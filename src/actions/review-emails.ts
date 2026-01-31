'use server';

/**
 * Review Email Server Actions
 * Story 5.4 Task 4: Post-Purchase Email Workflow (AC #5)
 * 
 * Handles queuing of review request emails triggered after order delivery
 */

import { createClient } from '@/lib/supabase/server';
import { generateReviewToken } from '@/lib/reviews/tokens';

interface QueueReviewRequestResult {
  success: boolean;
  message: string;
  queuedCount?: number;
  error?: string;
}

/**
 * Queue review request emails for a delivered order
 * Triggered when order status changes to 'delivered'
 * Creates entries in review_request_queue table for each product in the order
 * Schedules emails for 7 days after delivery
 * Prevents duplicate queue entries
 * 
 * @param orderId - The order ID that was just delivered
 * @returns Result of the queuing operation
 */
export async function queueReviewRequest(
  orderId: string
): Promise<QueueReviewRequestResult> {
  try {
    const supabase = await createClient();

    // Get order details with customer info and check delivery status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        customer_id,
        delivered_at,
        created_at,
        customers (
          id,
          email,
          name
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return {
        success: false,
        message: 'Order not found',
        error: orderError?.message || 'Could not retrieve order details',
      };
    }

    // Verify order is delivered
    if (order.status !== 'delivered' || !order.delivered_at) {
      return {
        success: false,
        message: 'Order not delivered',
        error: 'Review requests can only be queued for delivered orders',
      };
    }

    // Supabase returns joined data as arrays
    const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
    if (!customer || !customer.email) {
      return {
        success: false,
        message: 'Customer not found',
        error: 'Could not retrieve customer email for review request',
      };
    }

    // Check if customer has opted out of review emails
    const { data: preferences, error: prefError } = await supabase
      .from('email_preferences')
      .select('review_emails, unsubscribe_all')
      .eq('customer_id', customer.id)
      .maybeSingle();

    if (prefError) {
      console.error('Error checking email preferences:', prefError);
      // Continue anyway - we'll default to sending if preferences can't be checked
    }

    // Skip if customer opted out of review emails or all emails
    if (preferences) {
      if (preferences.unsubscribe_all || preferences.review_emails === false) {
        return {
          success: true,
          message: 'Customer opted out of review emails',
          queuedCount: 0,
        };
      }
    }

    // Get order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        product_id,
        products (
          id,
          name,
          images
        )
      `)
      .eq('order_id', orderId);

    if (itemsError || !orderItems || orderItems.length === 0) {
      return {
        success: false,
        message: 'No order items found',
        error: itemsError?.message || 'Could not retrieve order items',
      };
    }

    // Schedule for immediate sending (trigger already handled the 7-day delay)
    const scheduledFor = new Date();

    let queuedCount = 0;
    const queueErrors: string[] = [];

    // Queue review request for each product
    for (const item of orderItems) {
      // Supabase returns joined data as arrays
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      if (!product) {
        queueErrors.push(`Product not found for item ${item.id}`);
        continue;
      }

      // Check for existing queue entry to prevent duplicates
      const { data: existingQueue, error: checkError } = await supabase
        .from('review_request_queue')
        .select('id')
        .eq('order_id', orderId)
        .eq('product_id', product.id)
        .eq('customer_id', customer.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing queue entry:', checkError);
        queueErrors.push(`Could not check existing queue for product ${product.id}`);
        continue;
      }

      if (existingQueue) {
        // Skip - already queued
        continue;
      }

      // Generate review token for this product
      const reviewToken = await generateReviewToken(
        orderId,
        product.id,
        customer.id,
        customer.email
      );

      // Get product image (first image or placeholder)
      const productImage = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : `${process.env.NEXT_PUBLIC_APP_URL}/images/placeholder.jpg`;

      // Create review URL
      const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reviews/submit?token=${encodeURIComponent(reviewToken)}`;

      // Insert into review request queue
      const { error: insertError } = await supabase
        .from('review_request_queue')
        .insert({
          order_id: orderId,
          product_id: product.id,
          customer_id: customer.id,
          email: customer.email,
          product_name: product.name,
          product_image: productImage,
          review_token: reviewToken,
          review_url: reviewUrl,
          scheduled_for: scheduledFor.toISOString(),
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error queueing review request:', insertError);
        queueErrors.push(`Failed to queue review for product ${product.id}: ${insertError.message}`);
        continue;
      }

      // Add to email_queue for immediate sending
      const { error: emailQueueError } = await supabase
        .from('email_queue')
        .insert({
          email_type: 'review_request_email',
          recipient_email: customer.email,
          user_id: customer.id,
          subject: `Review your purchase: ${product.name}`,
          template_data: {
            customer_name: customer.name,
            product_name: product.name,
            product_image: productImage,
            review_url: reviewUrl,
            order_date: new Date(order.created_at).toLocaleDateString(),
          },
          priority: 5,
          status: 'pending',
          scheduled_for: new Date().toISOString(),
        });

      if (emailQueueError) {
        console.error('Error adding to email queue:', emailQueueError);
        // We don't fail the whole operation if just the email queue insert fails, 
        // but we should probably log it. The review_request_queue entry is there.
      }

      queuedCount++;
    }

    // Return success even if some items failed (partial success)
    if (queuedCount > 0) {
      return {
        success: true,
        message: queueErrors.length > 0
          ? `Queued ${queuedCount} review request(s) with ${queueErrors.length} error(s)`
          : `Successfully queued ${queuedCount} review request(s)`,
        queuedCount,
      };
    }

    // All items failed or already queued
    return {
      success: queueErrors.length === 0,
      message: queueErrors.length > 0
        ? `Failed to queue any review requests: ${queueErrors.join(', ')}`
        : 'All review requests already queued',
      queuedCount: 0,
      error: queueErrors.length > 0 ? queueErrors.join(', ') : undefined,
    };

  } catch (error) {
    console.error('Unexpected error in queueReviewRequest:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if review requests have been queued for an order
 * Useful for preventing duplicate queuing
 * 
 * @param orderId - The order ID to check
 * @returns Boolean indicating if review requests are queued
 */
export async function areReviewRequestsQueued(orderId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('review_request_queue')
      .select('id')
      .eq('order_id', orderId)
      .limit(1);

    if (error) {
      console.error('Error checking review request queue:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in areReviewRequestsQueued:', error);
    return false;
  }
}

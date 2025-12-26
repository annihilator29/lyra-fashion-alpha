/**
 * Order Confirmation Email API Route
 * Story 3-4: Order Confirmation & Email Notification
 * POST /api/send-order-confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderConfirmation, validateEmail } from '@/lib/resend';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retry helper with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts
 */
async function sendWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    // Validate input
    if (!orderId) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Order ID is required', code: 'INVALID_INPUT' },
        },
        { status: 400 }
      );
    }

    // Validate UUID format
    if (!UUID_REGEX.test(orderId)) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Invalid order ID format', code: 'INVALID_UUID' },
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Order not found', code: 'ORDER_NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // Validate customer email (allowing null/undefined for guest orders)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerEmail = (order as any).customer_email || null;
    if (customerEmail && !validateEmail(customerEmail)) {
      // Update order with error
      await supabase
        .from('orders')
        .update({
          email_error: 'Invalid email format',
          email_sent: false,
        })
        .eq('id', orderId);

      return NextResponse.json(
        {
          data: null,
          error: { message: 'Invalid email format', code: 'INVALID_EMAIL' },
        },
        { status: 400 }
      );
    }

    // Send email with retry logic
    const emailResult = await sendWithRetry(
      () => sendOrderConfirmation(order, supabase as unknown as { from: (table: string) => unknown }),
      3
    );

    if (emailResult) {
      // Log to email_logs
      await supabase.from('email_logs').insert({
        order_id: orderId,
        email_type: 'order_confirmation',
        resend_id: emailResult.emailId,
        recipient_email: customerEmail,
        status: 'sent',
        sent_at: new Date().toISOString(),
        error_message: null,
      });

      return NextResponse.json(
        {
          data: { emailId: emailResult.emailId, sentAt: new Date().toISOString() },
          error: null,
        },
        { status: 200 }
      );
    }

    // Email send failed - already logged in sendOrderConfirmation
    return NextResponse.json(
      {
        data: null,
        error: { message: 'Failed to send email', code: 'EMAIL_SEND_FAILED' },
      },
      { status: 500 }
    );
   } catch (error: unknown) {
    console.error('Email API error:', error);

    return NextResponse.json(
      {
        data: null,
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' },
      },
      { status: 500 }
    );
  }
}

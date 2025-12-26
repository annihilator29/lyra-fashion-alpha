/**
 * Resend Email Service
 * Story 3-4: Order Confirmation & Email Notification
 */

import { Resend } from 'resend';
import { render } from '@react-email/components';
import OrderConfirmationEmail from '@/emails/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send order confirmation email
 * @param order - Order object with items and customer details
 * @param supabase - Supabase client for updating order status
 * @returns Email ID if successful, null if failed
 */
export async function sendOrderConfirmation(
  order: { customer_email?: string } & Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<{ emailId: string } | null> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!order.customer_email || !emailRegex.test(order.customer_email)) {
    // Update order with validation error
    await supabase
      .from('orders')
      .update({
        email_error: 'Invalid email format',
      })
      .eq('id', (order as Record<string, unknown>).id);
    throw new Error('INVALID_EMAIL');
  }

  try {
    // Render React Email component to HTML
    const emailHtml = await render(<OrderConfirmationEmail order={order} />);

    const { data, error } = await resend.emails.send({
      from: 'Lyra Fashion <onboarding@resend.dev>',
      to: order.customer_email,
      subject: `Order Confirmation - ${(order as Record<string, unknown>).order_number}`,
      html: emailHtml,
    });

    if (error) {
      // Log structured error and update order
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Email send failed',
          order_id: (order as Record<string, unknown>).id,
          error_code: error.name,
          error_message: error.message,
        })
      );

      await supabase
        .from('orders')
        .update({
          email_error: error.message,
        })
        .eq('id', (order as Record<string, unknown>).id);

      throw new Error('EMAIL_SEND_FAILED');
    }

    // Update order with success
    await supabase
      .from('orders')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        email_error: null,
      })
      .eq('id', (order as Record<string, unknown>).id);

    return { emailId: data.id };
  } catch (error: unknown) {
    // Re-throw if already EMAIL_SEND_FAILED
    if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
      throw error;
    }

    // Log unexpected errors
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Unexpected email error',
        order_id: (order as Record<string, unknown>).id,
        error_code: error instanceof Error ? error.name : 'Unknown',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
    );

    await supabase
      .from('orders')
      .update({
        email_error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', (order as Record<string, unknown>).id);

    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email address
 * @param email - Email address to validate
 * @returns True if email is valid format
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

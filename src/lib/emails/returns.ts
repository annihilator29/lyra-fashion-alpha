/**
 * Returns Email Service
 * Story 6.4: Returns & Refunds Processing - AC-2, AC-4
 * 
 * Email notification service for return status changes.
 * Sends emails asynchronously to avoid blocking mutations.
 */

import { Resend } from 'resend';
import ReturnRequestedEmail from '@/emails/return-requested';
import ReturnApprovedEmail from '@/emails/return-approved';
import ReturnReceivedEmail from '@/emails/return-received';
import ReturnRefundedEmail from '@/emails/return-refunded';
import ReturnRejectedEmail from '@/emails/return-rejected';
import type { Return, ReturnReason } from '@/types/returns';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// From address for all return emails
const FROM_ADDRESS = 'Lyra Fashion Returns <returns@lyrafashion.com>';

interface OrderInfo {
  id: string;
  order_number: string;
  customer_email: string;
}

interface ReturnRequestedEmailProps {
  returnData: Return & { reason: ReturnReason };
  order: OrderInfo;
}

/**
 * Send return requested confirmation email (AC-2)
 * Triggered when customer submits a return request
 */
export async function sendReturnRequestedEmail({
  returnData,
  order,
}: ReturnRequestedEmailProps): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return;
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customer_email,
      subject: `Return Request Received - RMA ${returnData.rma_number}`,
      react: ReturnRequestedEmail({
        returnData: {
          rma_number: returnData.rma_number,
          reason: returnData.reason,
          refund_amount: returnData.refund_amount,
          requested_at: returnData.requested_at,
        },
        order: {
          id: order.id,
          order_number: order.order_number,
        },
      }),
    });

    console.log(`Return requested email sent to ${order.customer_email} for RMA ${returnData.rma_number}`);
  } catch (error) {
    console.error('Failed to send return requested email:', error);
    // Don't throw - email failure shouldn't block the return process
  }
}

interface ReturnApprovedEmailProps {
  returnData: Return;
  order: OrderInfo;
}

/**
 * Send return approved email with shipping label
 * Triggered when admin approves return and generates label
 */
export async function sendReturnApprovedEmail({
  returnData,
  order,
}: ReturnApprovedEmailProps): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return;
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customer_email,
      subject: `Return Approved - Shipping Label Ready for RMA ${returnData.rma_number}`,
      react: ReturnApprovedEmail({
        returnData: {
          rma_number: returnData.rma_number,
          tracking_number: returnData.tracking_number,
          shipping_label_url: returnData.shipping_label_url,
        },
        order: {
          id: order.id,
          order_number: order.order_number,
        },
      }),
    });

    console.log(`Return approved email sent to ${order.customer_email} for RMA ${returnData.rma_number}`);
  } catch (error) {
    console.error('Failed to send return approved email:', error);
  }
}

interface ReturnReceivedEmailProps {
  returnData: Return;
  order: OrderInfo;
}

/**
 * Send return received email
 * Triggered when return package arrives at warehouse
 */
export async function sendReturnReceivedEmail({
  returnData,
  order,
}: ReturnReceivedEmailProps): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return;
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customer_email,
      subject: `Return Received - Now Being Inspected (RMA ${returnData.rma_number})`,
      react: ReturnReceivedEmail({
        returnData: {
          rma_number: returnData.rma_number,
          received_at: returnData.received_at || new Date().toISOString(),
        },
        order: {
          id: order.id,
          order_number: order.order_number,
        },
      }),
    });

    console.log(`Return received email sent to ${order.customer_email} for RMA ${returnData.rma_number}`);
  } catch (error) {
    console.error('Failed to send return received email:', error);
  }
}

interface ReturnRefundedEmailProps {
  returnData: Return;
  order: OrderInfo;
}

/**
 * Send refund processed email (AC-4)
 * Triggered when refund is processed via Stripe
 */
export async function sendReturnRefundedEmail({
  returnData,
  order,
}: ReturnRefundedEmailProps): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return;
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customer_email,
      subject: `Refund Processed - $${returnData.refund_amount.toFixed(2)} Refunded (RMA ${returnData.rma_number})`,
      react: ReturnRefundedEmail({
        returnData: {
          rma_number: returnData.rma_number,
          refund_amount: returnData.refund_amount,
          stripe_refund_id: returnData.stripe_refund_id,
          refunded_at: returnData.refunded_at || new Date().toISOString(),
        },
        order: {
          id: order.id,
          order_number: order.order_number,
        },
      }),
    });

    console.log(`Return refunded email sent to ${order.customer_email} for RMA ${returnData.rma_number}`);
  } catch (error) {
    console.error('Failed to send return refunded email:', error);
  }
}

interface ReturnRejectedEmailProps {
  returnData: Return;
  order: OrderInfo;
}

/**
 * Send return rejected email
 * Triggered when return is rejected after inspection
 */
export async function sendReturnRejectedEmail({
  returnData,
  order,
}: ReturnRejectedEmailProps): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send');
      return;
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: order.customer_email,
      subject: `Return Update Required - Action Needed (RMA ${returnData.rma_number})`,
      react: ReturnRejectedEmail({
        returnData: {
          rma_number: returnData.rma_number,
          rejection_reason: returnData.rejection_reason || 'Items do not meet return criteria',
          inspection_notes: returnData.inspection_notes,
          rejected_at: returnData.rejected_at || new Date().toISOString(),
        },
        order: {
          id: order.id,
          order_number: order.order_number,
        },
      }),
    });

    console.log(`Return rejected email sent to ${order.customer_email} for RMA ${returnData.rma_number}`);
  } catch (error) {
    console.error('Failed to send return rejected email:', error);
  }
}

/**
 * Map return status to email function
 * Helper to determine which email to send based on status change
 */
export const statusEmailMap = {
  requested: sendReturnRequestedEmail,
  approved: sendReturnApprovedEmail,
  shipped: null, // No email for shipped - use approved instead
  received: sendReturnReceivedEmail,
  inspected: null, // No email for inspected - wait for refund/reject
  refunded: sendReturnRefundedEmail,
  rejected: sendReturnRejectedEmail,
} as const;

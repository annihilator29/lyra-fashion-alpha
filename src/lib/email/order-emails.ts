/**
 * Order Email Service
 * Story 7.3: Order Management & Fulfillment Tools
 * AC3, AC4, AC5: Email notifications for order events
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderStatusUpdateEmail from '@/emails/order-status-update';
import ShippingConfirmationEmail from '@/emails/shipping-confirmation';
import RefundConfirmationEmail from '@/emails/refund-confirmation';
import ReturnInstructionsEmail from '@/emails/return-instructions';

const resend = new Resend(process.env.RESEND_API_KEY || '');

const FROM_EMAIL = 'Lyra Fashion <orders@lyrafashion.com>';

export interface SendStatusUpdateEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  oldStatus?: string;
  newStatus: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface SendShippingConfirmationEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery?: string;
  shippingAddress: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  orderItems?: Array<{
    product_name?: string;
    quantity: number;
    variant?: {
      size?: string;
      color?: string;
    } | null;
  }>;
}

export interface SendRefundConfirmationEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  refundAmount: number;
  refundReason: string;
  refundId: string;
  expectedProcessingDays: number;
}

export interface SendReturnInstructionsEmailParams {
  to: string;
  customerName: string;
  orderNumber: string;
  rmaNumber: string;
  returnItems: Array<{
    product_name?: string;
    quantity: number;
    variant?: {
      size?: string;
      color?: string;
    } | null;
  }>;
  returnAddress: {
    name: string;
    address_line1: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  returnDeadline: string;
}

/**
 * Send order status update email
 */
export async function sendStatusUpdateEmail(params: SendStatusUpdateEmailParams) {
  try {
    const html = await render(
      OrderStatusUpdateEmail({
        orderNumber: params.orderNumber,
        oldStatus: params.oldStatus,
        newStatus: params.newStatus,
        customerName: params.customerName,
        trackingNumber: params.trackingNumber,
        carrier: params.carrier,
        estimatedDelivery: params.estimatedDelivery,
        notes: params.notes,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Order ${params.orderNumber} Status Update: ${params.newStatus.replace('_', ' ')}`,
      html,
    });

    if (error) {
      console.error('Failed to send status update email:', error);
      return { success: false, error: error.message };
    }

    console.log('Status update email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Status update email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Send shipping confirmation email
 */
export async function sendShippingConfirmationEmail(params: SendShippingConfirmationEmailParams) {
  try {
    const html = await render(
      ShippingConfirmationEmail({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        carrier: params.carrier,
        trackingNumber: params.trackingNumber,
        estimatedDelivery: params.estimatedDelivery,
        shippingAddress: params.shippingAddress,
        orderItems: params.orderItems,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Your Order ${params.orderNumber} Has Shipped!`,
      html,
    });

    if (error) {
      console.error('Failed to send shipping confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log('Shipping confirmation email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Shipping confirmation email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Send refund confirmation email
 */
export async function sendRefundConfirmationEmail(params: SendRefundConfirmationEmailParams) {
  try {
    const html = await render(
      RefundConfirmationEmail({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        refundAmount: params.refundAmount,
        refundReason: params.refundReason,
        refundId: params.refundId,
        refundDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        expectedProcessingDays: params.expectedProcessingDays,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Refund Confirmation for Order ${params.orderNumber}`,
      html,
    });

    if (error) {
      console.error('Failed to send refund confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log('Refund confirmation email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Refund confirmation email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Send return instructions email
 */
export async function sendReturnInstructionsEmail(params: SendReturnInstructionsEmailParams) {
  try {
    const html = await render(
      ReturnInstructionsEmail({
        customerName: params.customerName,
        rmaNumber: params.rmaNumber,
        returnItems: params.returnItems,
        returnAddress: params.returnAddress,
        returnDeadline: params.returnDeadline,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Return Instructions for Order ${params.orderNumber}`,
      html,
    });

    if (error) {
      console.error('Failed to send return instructions email:', error);
      return { success: false, error: error.message };
    }

    console.log('Return instructions email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Return instructions email error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

/**
 * Generate RMA number
 */
export function generateRMANumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RMA-${timestamp}-${random}`;
}

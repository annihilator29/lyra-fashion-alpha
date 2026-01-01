/**
 * Email Service - Comprehensive Email Sending Functions
 * Story 4.5: Email Notifications & Marketing Preferences
 */

import React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import OrderConfirmationEmail from '@/emails/order-confirmation';
import ShipmentNotificationEmail from '@/emails/shipment-notification';
import DeliveryConfirmationEmail from '@/emails/delivery-confirmation';
import NewsletterEmail from '@/emails/newsletter';
import SalesEmail from '@/emails/sales';
import PersonalizedRecommendationsEmail from '@/emails/personalized-recommendations';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email types
 */
export type EmailType =
  | 'order_confirmation'
  | 'shipment_notification'
  | 'delivery_confirmation'
  | 'newsletter'
  | 'sales'
  | 'personalized_recommendations';

/**
 * Lazy initialize Resend client to avoid build-time env var access
 */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

/**
 * Validate email address
 * @param email - Email address to validate
 * @returns True if email is valid format
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Log email send error
 */
function logEmailError(
  context: string,
  emailId?: string,
  error?: Error | unknown
): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `Email send failed: ${context}`,
      email_id: emailId || 'unknown',
      error_code: error instanceof Error ? error.name : 'Unknown',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    })
  );
}

/**
 * Send order confirmation email
 * @param email - Recipient email address
 * @param order - Order object with items and customer details
 * @returns Email ID if successful, throws error if failed
 */
export async function sendOrderConfirmation(
  email: string,
  order: {
    customer_name?: string;
    customer_email?: string;
    order_number: string;
    total: number;
    shipping?: number;
    tax?: number;
    created_at: string;
    order_items: Array<{
      id: string;
      products?: {
        name: string;
        images?: string[];
      };
      variant?: {
        size?: string;
        color?: string;
      };
      quantity: number;
      price: number;
    }>;
    shipping_address?: {
      full_name?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  }
): Promise<{ emailId: string }> {
  // Validate email
  if (!email || !validateEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  try {
    const resend = getResendClient();
    const emailHtml = await render(<OrderConfirmationEmail order={order} />);

    const { data, error } = await resend.emails.send({
      from: 'Lyra Fashion <orders@lyrafashion.com.np>',
      to: email,
      subject: `Order Confirmation - ${order.order_number}`,
      html: emailHtml,
    });

    if (error) {
      logEmailError('order_confirmation', order.order_number, error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return { emailId: data.id };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      throw error;
    }

    if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
      throw error;
    }

    logEmailError('order_confirmation', order.order_number, error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Send shipment notification email
 * @param email - Recipient email address
 * @param details - Shipment details
 * @returns Email ID if successful, throws error if failed
 */
export async function sendShipmentNotification(
  email: string,
  details: {
    customerName?: string;
    orderNumber: string;
    trackingNumber: string;
    carrier: string;
    trackingUrl: string;
    estimatedDelivery: string;
    items: number;
  }
): Promise<{ emailId: string }> {
  if (!email || !validateEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  try {
    const resend = getResendClient();
    const emailHtml = await render(<ShipmentNotificationEmail {...details} />);

    const { data, error } = await resend.emails.send({
      from: 'Lyra Fashion <orders@lyrafashion.com.np>',
      to: email,
      subject: `Your Order Has Shipped - ${details.orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      logEmailError('shipment_notification', details.orderNumber, error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return { emailId: data.id };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      throw error;
    }

    if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
      throw error;
    }

    logEmailError('shipment_notification', details.orderNumber, error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Send delivery confirmation email
 * @param email - Recipient email address
 * @param details - Delivery details
 * @returns Email ID if successful, throws error if failed
 */
export async function sendDeliveryConfirmation(
  email: string,
  details: {
    customerName?: string;
    orderNumber: string;
    items: number;
    reviewUrl: string;
  }
): Promise<{ emailId: string }> {
  if (!email || !validateEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  try {
    const resend = getResendClient();
    const emailHtml = await render(<DeliveryConfirmationEmail {...details} />);

    const { data, error } = await resend.emails.send({
      from: 'Lyra Fashion <orders@lyrafashion.com.np>',
      to: email,
      subject: `Your Order Has Arrived - ${details.orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      logEmailError('delivery_confirmation', details.orderNumber, error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return { emailId: data.id };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      throw error;
    }

    if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
      throw error;
    }

    logEmailError('delivery_confirmation', details.orderNumber, error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Send newsletter email
 * @param email - Recipient email address
 * @param details - Newsletter content
 * @returns Email ID if successful, throws error if failed
 */
export async function sendNewsletter(
  email: string,
  details: {
    customerName?: string;
    unsubscribeUrl: string;
    preferencesUrl: string;
    featuredArticles?: Array<{
      title: string;
      excerpt: string;
      imageUrl: string;
      link: string;
    }>;
  }
): Promise<{ emailId: string }> {
  if (!email || !validateEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  try {
    const resend = getResendClient();
    const emailHtml = await render(<NewsletterEmail {...details} />);

    const { data, error } = await resend.emails.send({
      from: 'Lyra Fashion <news@lyrafashion.com.np>',
      to: email,
      subject: 'Latest from Lyra Fashion',
      html: emailHtml,
      replyTo: 'support@lyrafashion.com',
    });

    if (error) {
      logEmailError('newsletter', undefined, error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return { emailId: data.id };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      throw error;
    }

    if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
      throw error;
    }

    logEmailError('newsletter', undefined, error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Send sales email
 * @param email - Recipient email address
 * @param details - Sale details
 * @returns Email ID if successful, throws error if failed
 */
export async function sendSalesEmail(
  email: string,
  details: {
    customerName?: string;
    unsubscribeUrl: string;
    preferencesUrl: string;
    discountCode: string;
    discountAmount: string; // e.g., "20%" or "$10"
    validUntil: string;
    saleItems?: Array<{
      name: string;
      originalPrice: string;
      salePrice: string;
      imageUrl: string;
      link: string;
    }>;
  }
): Promise<{ emailId: string }> {
  if (!email || !validateEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  try {
    const resend = getResendClient();
    const emailHtml = await render(<SalesEmail {...details} />);

    const { data, error } = await resend.emails.send({
      from: 'Lyra Fashion <sales@lyrafashion.com.np>',
      to: email,
      subject: `Special Offer: ${details.discountAmount} Off!`,
      html: emailHtml,
      replyTo: 'support@lyrafashion.com',
    });

    if (error) {
      logEmailError('sales', undefined, error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return { emailId: data.id };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      throw error;
    }

    if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
      throw error;
    }

    logEmailError('sales', undefined, error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Send personalized recommendations email
 * @param email - Recipient email address
 * @param details - Recommendation details
 * @returns Email ID if successful, throws error if failed
 */
export async function sendPersonalizedRecommendations(
  email: string,
  details: {
    customerName?: string;
    unsubscribeUrl: string;
    preferencesUrl: string;
    reasonText?: string;
    recommendations: Array<{
      id: string;
      name: string;
      imageUrl: string;
      price: string;
      link: string;
      category: string;
    }>;
  }
): Promise<{ emailId: string }> {
  if (!email || !validateEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  try {
    const resend = getResendClient();
    const emailHtml = await render(<PersonalizedRecommendationsEmail {...details} />);

    const { data, error } = await resend.emails.send({
      from: 'Lyra Fashion <news@lyrafashion.com.np>',
      to: email,
      subject: 'Recommended Just For You',
      html: emailHtml,
      replyTo: 'support@lyrafashion.com',
    });

    if (error) {
      logEmailError('personalized_recommendations', undefined, error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return { emailId: data.id };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      throw error;
    }

    if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
      throw error;
    }

    logEmailError('personalized_recommendations', undefined, error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

/**
 * Generic email send function with template support
 * @param email - Recipient email address
 * @param template - Email template component
 * @param subject - Email subject
 * @param from - From email address (default: orders@lyrafashion.com.np)
 * @param replyTo - Reply-to email address
 * @returns Email ID if successful, throws error if failed
 */
export async function sendEmail(
  email: string,
  template: React.ReactElement,
  subject: string,
  from: string = 'Lyra Fashion <orders@lyrafashion.com.np>',
  replyTo?: string
): Promise<{ emailId: string }> {
  if (!email || !validateEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  try {
    const resend = getResendClient();
    const emailHtml = await render(template);

    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject,
      html: emailHtml,
      replyTo,
    });

    if (error) {
      logEmailError('generic_email', undefined, error);
      throw new Error('EMAIL_SEND_FAILED');
    }

    return { emailId: data.id };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INVALID_EMAIL') {
      throw error;
    }

    if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
      throw error;
    }

    logEmailError('generic_email', undefined, error);
    throw new Error('EMAIL_SEND_FAILED');
  }
}

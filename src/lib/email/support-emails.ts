/**
 * Support Email Service
 * Story 7.4b: Support Ticket System
 *
 * Resend integration for support emails.
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import SupportResponseEmail from '@/emails/support-response';
import SupportAcknowledgmentEmail from '@/emails/support-acknowledgment';
import SupportResolutionEmail from '@/emails/support-resolution';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM_EMAIL = 'Lyra Fashion <noreply@lyrafashion.com>';

// ============================================================
// Types
// ============================================================

export interface SendSupportEmailParams {
  to: string;
  subject: string;
  body: string;
  customerName: string;
}

export interface SendTicketConfirmationParams {
  to: string;
  customerName: string;
  ticketNumber: string;
  subject: string;
}

export interface NotifyTicketAssignedParams {
  to: string;           // agent email
  agentName: string;
  ticketNumber: string;
  ticketSubject: string;
  customerName: string;
}

// ============================================================
// Generic Support Email (AC3 — send email from admin)
// ============================================================

export async function sendSupportEmail(
  params: SendSupportEmailParams
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const html = await render(
      SupportResponseEmail({
        customerName: params.customerName,
        body: params.body,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html,
    });

    if (error) {
      console.error('sendSupportEmail - Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Support email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('sendSupportEmail - Catch:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send email',
    };
  }
}

// ============================================================
// Ticket Acknowledgment (AC1 — confirm ticket created)
// ============================================================

export async function sendTicketConfirmation(
  params: SendTicketConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = await render(
      SupportAcknowledgmentEmail({
        customerName: params.customerName,
        ticketNumber: params.ticketNumber,
        ticketSubject: params.subject,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `We received your request — Ticket ${params.ticketNumber}`,
      html,
    });

    if (error) {
      console.error('sendTicketConfirmation - Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Ticket confirmation email sent:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('sendTicketConfirmation - Catch:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send confirmation',
    };
  }
}

// ============================================================
// Ticket Resolution (AC1)
// ============================================================

export async function notifyTicketAssigned(
  params: NotifyTicketAssignedParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = await render(
      SupportResolutionEmail({
        customerName: params.customerName,
        ticketNumber: params.ticketNumber,
        ticketSubject: params.ticketSubject,
        agentName: params.agentName,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Your ticket ${params.ticketNumber} has been resolved`,
      html,
    });

    if (error) {
      console.error('notifyTicketAssigned - Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Resolution notification sent:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('notifyTicketAssigned - Catch:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send notification',
    };
  }
}

/**
 * Support Email Server Actions
 * Story 7.4b: Support Ticket System
 *
 * Send emails to customers using Resend and log email history.
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { sendEmailSchema, type SendEmailInput } from '@/lib/schemas/support';
import { sendSupportEmail } from '@/lib/email/support-emails';
import type { ActionResult } from '@/types/support';

// ============================================================
// Send Email to Customer (AC3)
// ============================================================

/**
 * Send a support email to a customer, optionally logged to a ticket.
 */
export async function sendEmailToCustomer(
  input: SendEmailInput
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    const parsed = sendEmailSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues.map((e: any) => e.message).join(', '),
      };
    }

    const { customerId, subject, body, replyToTicketId } = parsed.data;
    const supabase = createAdminClient() as any;

    // Fetch customer email + most recent order number for placeholder interpolation
    const [customerRes, orderRes] = await Promise.all([
      supabase
        .from('customers')
        .select('email, first_name, last_name, name')
        .eq('id', customerId)
        .single(),
      supabase
        .from('orders')
        .select('order_number')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (customerRes.error || !customerRes.data) {
      return { data: null, error: 'Customer not found' };
    }

    const customer = customerRes.data;
    const orderNumber: string = orderRes.data?.order_number ?? 'N/A';

    const customerName =
      customer.first_name
        ? `${customer.first_name} ${customer.last_name ?? ''}`.trim()
        : customer.name ?? 'Customer';

    // Interpolate all supported placeholders (AC4)
    const interpolate = (text: string) =>
      text
        .replace(/{{customer_name}}/g, customerName)
        .replace(/{{order_number}}/g, orderNumber)
        .replace(/{{support_agent}}/g, 'Lyra Support Team');

    const interpolatedBody = interpolate(body);
    const interpolatedSubject = interpolate(subject);

    // Send via Resend
    const sendResult = await sendSupportEmail({
      to: customer.email,
      subject: interpolatedSubject,
      body: interpolatedBody,
      customerName,
    });

    if (sendResult.error) {
      return { data: null, error: sendResult.error };
    }

    // Log message on ticket if provided
    if (replyToTicketId) {
      await supabase.from('support_ticket_messages').insert({
        ticket_id: replyToTicketId,
        sender_type: 'admin',
        content: `📧 Email sent — Subject: "${interpolatedSubject}"\n\n${interpolatedBody}`,
        is_internal: false,
      });

      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', replyToTicketId);
    }

    return { data: null };
  } catch (err) {
    console.error('sendEmailToCustomer - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to send email',
    };
  }
}

// ============================================================
// Email History (AC3)
// ============================================================

/**
 * Get the email send history for a customer (messages logged on tickets).
 */
export async function getEmailHistory(
  customerId: string
): Promise<
  ActionResult<
    Array<{
      id: string;
      ticket_id: string;
      ticket_number: string;
      content: string;
      created_at: string;
    }>
  >
> {
  try {
    await requireAdmin();
    const supabase = createAdminClient() as any;

    // Get all ticket IDs for this customer
    const { data: tickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('id, ticket_number')
      .eq('customer_id', customerId);

    if (ticketsError) {
      return { data: [], error: ticketsError.message };
    }

    if (!tickets || tickets.length === 0) {
      return { data: [] };
    }

    const ticketIds = tickets.map((t: any) => t.id);
    const ticketMap = new Map(tickets.map((t: any) => [t.id, t.ticket_number]));

    // Get non-internal admin messages (these are sent emails)
    const { data: messages, error: msgError } = await supabase
      .from('support_ticket_messages')
      .select('id, ticket_id, content, created_at')
      .in('ticket_id', ticketIds)
      .eq('sender_type', 'admin')
      .eq('is_internal', false)
      .order('created_at', { ascending: false });

    if (msgError) {
      return { data: [], error: msgError.message };
    }

    const history = (messages ?? []).map((m: any) => ({
      id: m.id,
      ticket_id: m.ticket_id,
      ticket_number: ticketMap.get(m.ticket_id) ?? '',
      content: m.content,
      created_at: m.created_at,
    }));

    return { data: history };
  } catch (err) {
    console.error('getEmailHistory - Catch:', err);
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch email history',
    };
  }
}

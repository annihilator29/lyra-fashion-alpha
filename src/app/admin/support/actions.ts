/**
 * Support Ticket Server Actions
 * Story 7.4b: Support Ticket System
 *
 * CRUD operations for support tickets, messages, and customer internal notes.
 * All actions require admin role (RBAC via requireAdmin).
 */

'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';
import { revalidatePath } from 'next/cache';
import {
  createTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  ticketMessageSchema,
  supportNoteSchema,
  type CreateTicketInput,
  type UpdateTicketStatusInput,
  type AssignTicketInput,
  type TicketMessageInput,
} from '@/lib/schemas/support';
import type {
  TicketListResult,
  TicketDetailResult,
  TicketFilters,
  Pagination,
  ActionResult,
  SupportTicket,
} from '@/types/support';

// ============================================================
// Helpers
// ============================================================

/**
 * Generate a ticket number: TKT-{timestamp}-{random4}
 */
function generateTicketNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${ts}-${rand}`;
}

// ============================================================
// Ticket Listing (AC1)
// ============================================================

/**
 * List support tickets with filtering and pagination.
 */
export async function getTickets(
  filters: TicketFilters = {},
  pagination: Pagination = { page: 1, limit: 25 }
): Promise<TicketListResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient() as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('support_tickets') as any).select(
      `id, ticket_number, customer_id, subject, description, status, priority,
       assigned_to, created_by, created_at, updated_at, resolved_at,
       customer:customers!support_tickets_customer_id_fkey(id, email, first_name, last_name, name)`,
      { count: 'exact' }
    );

    // Status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }

    // Assigned-to filter
    if (filters.assigned_to && filters.assigned_to !== 'all') {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    // Date range
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setDate(end.getDate() + 1);
      query = query.lte('created_at', end.toISOString());
    }

    // Full-text search on subject / ticket_number
    if (filters.search && filters.search.trim().length > 0) {
      const s = filters.search.trim().replace(/[;'"\\]/g, '').slice(0, 100);
      query = query.or(`subject.ilike.%${s}%,ticket_number.ilike.%${s}%`);
    }

    // Pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    query = query.range(from, to).order('updated_at', { ascending: false });

    const { data: tickets, error, count } = await query;

    if (error) {
      console.error('getTickets - Error:', error);
      return { tickets: [], total: 0, hasMore: false, error: error.message };
    }

    return {
      tickets: (tickets ?? []) as SupportTicket[],
      total: count ?? 0,
      hasMore: from + pagination.limit < (count ?? 0),
    };
  } catch (err) {
    console.error('getTickets - Catch:', err);
    return {
      tickets: [],
      total: 0,
      hasMore: false,
      error: err instanceof Error ? err.message : 'Failed to fetch tickets',
    };
  }
}

// ============================================================
// Ticket Detail (AC1)
// ============================================================

/**
 * Get a single ticket with all its messages.
 */
export async function getTicketById(
  ticketId: string
): Promise<TicketDetailResult> {
  try {
    await requireAdmin();
    const supabase = createAdminClient() as any;

    // Fetch ticket with customer join
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(
        `*, customer:customers!support_tickets_customer_id_fkey(id, email, first_name, last_name, name)`
      )
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return {
        ticket: null,
        messages: [],
        error: ticketError?.message ?? 'Ticket not found',
      };
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from('support_ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('getTicketById - messages error:', msgError);
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ticket: ticket as any,
      messages: messages ?? [],
    };
  } catch (err) {
    console.error('getTicketById - Catch:', err);
    return {
      ticket: null,
      messages: [],
      error: err instanceof Error ? err.message : 'Failed to fetch ticket',
    };
  }
}

// ============================================================
// Create Ticket (AC1)
// ============================================================

/**
 * Create a new support ticket.
 */
export async function createTicket(
  input: CreateTicketInput
): Promise<ActionResult<{ id: string; ticket_number: string } | null>> {
  try {
    await requireAdmin();

    const parsed = createTicketSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues.map((e) => e.message).join(', '),
      };
    }

    const { customerId, subject, description, priority } = parsed.data;
    const supabase = createAdminClient() as any;

    const ticket_number = generateTicketNumber();

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ticket_number,
        customer_id: customerId,
        subject,
        description: description ?? null,
        priority,
        status: 'open',
      })
      .select('id, ticket_number')
      .single();

    if (error) {
      console.error('createTicket - Error:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/admin/support');
    return { data };
  } catch (err) {
    console.error('createTicket - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create ticket',
    };
  }
}

// ============================================================
// Update Ticket Status (AC1)
// ============================================================

/**
 * Update ticket status, optionally adding a system message note.
 */
export async function updateTicketStatus(
  input: UpdateTicketStatusInput
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    const parsed = updateTicketStatusSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues.map((e) => e.message).join(', '),
      };
    }

    const { ticketId, status, notes } = parsed.data;
    const supabase = createAdminClient() as any;

    const updatePayload: Record<string, unknown> = { status };
    if (status === 'resolved' || status === 'closed') {
      updatePayload.resolved_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('support_tickets')
      .update(updatePayload)
      .eq('id', ticketId);

    if (updateError) {
      console.error('updateTicketStatus - Error:', updateError);
      return { data: null, error: updateError.message };
    }

    // Add system message if notes provided
    if (notes && notes.trim().length > 0) {
      await supabase.from('support_ticket_messages').insert({
        ticket_id: ticketId,
        sender_type: 'system',
        content: `Status changed to "${status}". Note: ${notes.trim()}`,
        is_internal: true,
      });
    }

    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath('/admin/support');
    return { data: null };
  } catch (err) {
    console.error('updateTicketStatus - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update ticket',
    };
  }
}

// ============================================================
// Assign Ticket (AC1)
// ============================================================

/**
 * Assign a ticket to a support agent.
 */
export async function assignTicket(
  input: AssignTicketInput
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    const parsed = assignTicketSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues.map((e) => e.message).join(', '),
      };
    }

    const { ticketId, assignedTo } = parsed.data;
    const supabase = createAdminClient() as any;

    const { error } = await supabase
      .from('support_tickets')
      .update({ assigned_to: assignedTo })
      .eq('id', ticketId);

    if (error) {
      console.error('assignTicket - Error:', error);
      return { data: null, error: error.message };
    }

    revalidatePath(`/admin/support/${ticketId}`);
    revalidatePath('/admin/support');
    return { data: null };
  } catch (err) {
    console.error('assignTicket - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to assign ticket',
    };
  }
}

// ============================================================
// Add Ticket Message (AC2, AC3)
// ============================================================

/**
 * Add a message or internal note to a ticket.
 */
export async function addTicketMessage(
  input: TicketMessageInput
): Promise<ActionResult<{ id: string } | null>> {
  try {
    await requireAdmin();

    const parsed = ticketMessageSchema.safeParse(input);
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues.map((e) => e.message).join(', '),
      };
    }

    const { ticketId, content, isInternal } = parsed.data;
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('support_ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'admin',
        content,
        is_internal: isInternal,
      })
      .select('id')
      .single();

    if (error) {
      console.error('addTicketMessage - Error:', error);
      return { data: null, error: error.message };
    }

    // Bump ticket updated_at
    await supabase
      .from('support_tickets')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    revalidatePath(`/admin/support/${ticketId}`);
    return { data };
  } catch (err) {
    console.error('addTicketMessage - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to add message',
    };
  }
}

// ============================================================
// Customer Support Notes (AC2)
// ============================================================

/**
 * Append an internal support note to a customer profile.
 */
export async function updateCustomerNotes(
  customerId: string,
  content: string
): Promise<ActionResult<null>> {
  try {
    await requireAdmin();

    const parsed = supportNoteSchema.safeParse({ customerId, content });
    if (!parsed.success) {
      return {
        data: null,
        error: parsed.error.issues.map((e) => e.message).join(', '),
      };
    }

    const supabase = createAdminClient() as any;

    // Read current notes
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('support_notes')
      .eq('id', customerId)
      .single();

    if (fetchError || !customer) {
      return { data: null, error: 'Customer not found' };
    }

    const existingNotes = Array.isArray(customer.support_notes)
      ? customer.support_notes
      : [];

    const newNote = {
      id: crypto.randomUUID(),
      content: parsed.data.content,
      author: 'admin', // Could be enriched with actual user ID server-side
      created_at: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...existingNotes];

    const { error: updateError } = await supabase
      .from('customers')
      .update({ support_notes: updatedNotes })
      .eq('id', customerId);

    if (updateError) {
      console.error('updateCustomerNotes - Error:', updateError);
      return { data: null, error: updateError.message };
    }

    revalidatePath(`/admin/customers/${customerId}`);
    return { data: null };
  } catch (err) {
    console.error('updateCustomerNotes - Catch:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update notes',
    };
  }
}

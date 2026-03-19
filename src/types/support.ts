/**
 * Support System TypeScript Types
 * Story 7.4b: Support Ticket System
 */

// ============================================================
// Enums / Literals
// ============================================================

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'pending_customer'
  | 'resolved'
  | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TemplateCategory =
  | 'shipping'
  | 'returns'
  | 'product'
  | 'billing'
  | 'general';

export type MessageSenderType = 'admin' | 'customer' | 'system';

// ============================================================
// Core Entities
// ============================================================

export interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id: string | null;
  subject: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  /** Joined customer data (optional, from query) */
  customer?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    name: string | null;
  } | null;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_type: MessageSenderType;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface SupportTemplate {
  id: string;
  title: string;
  subject: string;
  body: string;
  category: TemplateCategory;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportNote {
  id: string;
  content: string;
  author: string; // admin user ID
  created_at: string;
}

// ============================================================
// Filter/Pagination Params
// ============================================================

export interface TicketFilters {
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
  assigned_to?: string | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

// ============================================================
// Action Result Types
// ============================================================

export interface TicketListResult {
  tickets: SupportTicket[];
  total: number;
  hasMore: boolean;
  error?: string;
}

export interface TicketDetailResult {
  ticket: SupportTicket | null;
  messages: SupportTicketMessage[];
  error?: string;
}

export interface TemplateListResult {
  templates: SupportTemplate[];
  total: number;
  error?: string;
}

export interface ActionResult<T = null> {
  data: T;
  error?: string;
}

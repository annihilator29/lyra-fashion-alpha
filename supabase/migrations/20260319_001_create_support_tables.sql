-- Migration: Support Ticket System Tables
-- Story 7.4b: Support Ticket System
-- Applied 2026-03-19
--
-- NOTE: This migration retroactively documents the schema that was applied
-- directly to the database during story development.
-- All tables, indexes, and RLS policies below already exist in production.

-- ============================================================
-- Support Tickets
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
    -- open | in_progress | pending_customer | resolved | closed
  priority TEXT NOT NULL DEFAULT 'medium',
    -- low | medium | high | urgent
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_customer
  ON support_tickets(customer_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets(status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned
  ON support_tickets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at
  ON support_tickets(created_at DESC);

-- ============================================================
-- Support Ticket Messages
-- ============================================================

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL,  -- admin | customer | system
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket
  ON support_ticket_messages(ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_created
  ON support_ticket_messages(created_at DESC);

-- ============================================================
-- Support Templates (Canned Responses)
-- ============================================================

CREATE TABLE IF NOT EXISTS support_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,  -- shipping | returns | product | billing | general
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_templates_category
  ON support_templates(category);

-- ============================================================
-- Customer Support Notes (JSONB on existing customers table)
-- ============================================================

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS support_notes JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_templates ENABLE ROW LEVEL SECURITY;

-- Admin-only access for all support tables
-- Requires: get_my_claim('user_role') = 'admin'
-- (Same pattern used in all other admin tables in this project)

DROP POLICY IF EXISTS "Admins can manage support_tickets" ON support_tickets;
CREATE POLICY "Admins can manage support_tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins can manage ticket messages" ON support_ticket_messages;
CREATE POLICY "Admins can manage ticket messages"
  ON support_ticket_messages
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins can manage support_templates" ON support_templates;
CREATE POLICY "Admins can manage support_templates"
  ON support_templates
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin'))
  );

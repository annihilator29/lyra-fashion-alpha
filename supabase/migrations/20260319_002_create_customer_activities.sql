-- Migration: Customer Activity Timeline Table
-- Story 7.4c: Customer Activity Timeline
--
-- Unified activity log for customer interactions

CREATE TABLE IF NOT EXISTS customer_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
    -- order_placed | order_shipped | order_delivered | order_returned
    -- ticket_created | ticket_status_changed | ticket_resolved
    -- email_sent | address_added | address_updated | preference_updated
  activity_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for timeline queries
CREATE INDEX IF NOT EXISTS idx_customer_activities_customer
  ON customer_activities(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_activities_type
  ON customer_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_customer_activities_created
  ON customer_activities(created_at DESC);

-- Composite index for common timeline queries (customer + date)
CREATE INDEX IF NOT EXISTS idx_customer_activities_customer_created
  ON customer_activities(customer_id, created_at DESC);

-- Row Level Security: Admin-only access
ALTER TABLE customer_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage customer_activities" ON customer_activities;
CREATE POLICY "Admins can manage customer_activities"
  ON customer_activities
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role' IN ('admin', 'super_admin')) OR
    ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin'))
  );

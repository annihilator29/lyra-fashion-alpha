-- Create sent_emails table for tracking sent emails
-- Story 4.5: Email Notifications & Marketing Preferences
-- Migration: 20260101_002_create_sent_emails_table.sql

-- Create sent_emails table
CREATE TABLE IF NOT EXISTS sent_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'shipment', 'delivery', 'newsletter', 'sales', 'personalized'
  subject TEXT NOT NULL,
  email_id VARCHAR(255), -- Resend email ID
  template_id VARCHAR(255), -- Template identifier
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store additional data (order_id, tracking_number, etc.)
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indices for common queries
CREATE INDEX idx_sent_emails_user_id ON sent_emails(user_id);
CREATE INDEX idx_sent_emails_email_address ON sent_emails(email_address);
CREATE INDEX idx_sent_emails_email_type ON sent_emails(email_type);
CREATE INDEX idx_sent_emails_status ON sent_emails(status);
CREATE INDEX idx_sent_emails_sent_at ON sent_emails(sent_at DESC);
CREATE INDEX idx_sent_emails_email_id ON sent_emails(email_id);
CREATE INDEX idx_sent_emails_user_email_type ON sent_emails(user_id, email_type);

-- Add index for date range queries
CREATE INDEX idx_sent_emails_date_range ON sent_emails(sent_at DESC, status);

-- Enable Row Level Security
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own email history
CREATE POLICY "Users can view own email history"
ON sent_emails
FOR SELECT
USING (auth.uid() = user_id);

-- Users cannot modify sent_emails (read-only for users)
CREATE POLICY "Users cannot modify email history"
ON sent_emails
FOR ALL
USING (false);

-- Service role can insert emails (for email service)
CREATE POLICY "Service can insert emails"
ON sent_emails
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Service role can update emails (for tracking opens/clicks)
CREATE POLICY "Service can update email status"
ON sent_emails
FOR UPDATE
WITH CHECK (auth.role() = 'service_role');

-- Service role can delete emails (for cleanup)
CREATE POLICY "Service can delete emails"
ON sent_emails
FOR DELETE
USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE sent_emails IS 'Tracks all emails sent to users for analytics and history purposes';
COMMENT ON COLUMN sent_emails.user_id IS 'Reference to auth.users table (optional for transactional emails)';
COMMENT ON COLUMN sent_emails.email_address IS 'Email address the email was sent to';
COMMENT ON COLUMN sent_emails.email_type IS 'Type of email: order_confirmation, shipment, delivery, newsletter, sales, personalized';
COMMENT ON COLUMN sent_emails.status IS 'Delivery status: sent, delivered, opened, clicked, bounced, failed';
COMMENT ON COLUMN sent_emails.metadata IS 'Additional context: order_id, tracking_number, recommendations, etc.';
COMMENT ON COLUMN sent_emails.email_id IS 'External email service ID (Resend email ID)';
COMMENT ON COLUMN sent_emails.template_id IS 'Identifier of the template used';

-- Add constraint to ensure valid email types
ALTER TABLE sent_emails
ADD CONSTRAINT chk_email_type
CHECK (
  email_type IN (
    'order_confirmation',
    'shipment',
    'delivery',
    'newsletter',
    'sales',
    'personalized'
  )
);

-- Add constraint to ensure valid status
ALTER TABLE sent_emails
ADD CONSTRAINT chk_status
CHECK (
  status IN (
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'failed'
  )
);

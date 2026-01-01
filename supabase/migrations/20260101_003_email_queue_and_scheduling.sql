-- Email queue and scheduling tables for batch marketing sends
-- Story 4.5: Email Notifications & Marketing Preferences
-- Migration: 20260101_003_email_queue_and_scheduling.sql

-- Create email_queue table for batch processing
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_type VARCHAR(50) NOT NULL, -- 'newsletter', 'sales', 'personalized'
  recipient_email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  template_id VARCHAR(255),
  template_data JSONB DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create scheduled_emails table for marketing campaigns
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  subject TEXT NOT NULL,
  template_id VARCHAR(255),
  template_data JSONB DEFAULT '{}'::jsonb,
  segment_criteria JSONB DEFAULT '{}'::jsonb, -- { "new_products": true, "sales": true }
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sent', 'cancelled'
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indices for email_queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority, status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_email_queue_recipient ON email_queue(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);

-- Add indices for scheduled_emails
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON scheduled_emails(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_scheduled_for ON scheduled_emails(scheduled_for, status);

-- Enable Row Level Security
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_queue
-- Service role can manage all emails
CREATE POLICY "Service can manage email queue"
ON email_queue
FOR ALL
USING (auth.role() = 'service_role');

-- RLS Policies for scheduled_emails
CREATE POLICY "Service can manage scheduled emails"
ON scheduled_emails
FOR ALL
USING (auth.role() = 'service_role');

-- Admin users can view scheduled emails (for admin dashboard)
CREATE POLICY "Admin can view scheduled emails"
ON scheduled_emails
FOR SELECT
USING (
  auth.uid() = created_by OR
  auth.role() = 'service_role'
);

-- Add comments for documentation
COMMENT ON TABLE email_queue IS 'Queue for batch email processing with retry logic';
COMMENT ON TABLE scheduled_emails IS 'Marketing email campaigns with scheduling and segmentation';

COMMENT ON COLUMN email_queue.priority IS '1 (highest) to 10 (lowest) - lower numbers send first';
COMMENT ON COLUMN email_queue.status IS 'pending, processing, sent, failed';
COMMENT ON COLUMN scheduled_emails.segment_criteria IS 'JSONB criteria for recipient segmentation';

-- Add constraints
ALTER TABLE email_queue
DROP CONSTRAINT IF EXISTS chk_email_queue_status;
ALTER TABLE email_queue
ADD CONSTRAINT chk_email_queue_status
CHECK (status IN ('pending', 'processing', 'sent', 'failed'));

ALTER TABLE scheduled_emails
DROP CONSTRAINT IF EXISTS chk_scheduled_emails_status;
ALTER TABLE scheduled_emails
ADD CONSTRAINT chk_scheduled_emails_status
CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_emails_updated_at BEFORE UPDATE ON scheduled_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

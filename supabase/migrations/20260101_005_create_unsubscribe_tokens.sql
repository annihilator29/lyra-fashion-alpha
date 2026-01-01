-- Create unsubscribe_tokens table
-- Story 4.5: Email Notifications & Marketing Preferences
-- Migration: 20260101_005_create_unsubscribe_tokens.sql

-- Create unsubscribe_tokens table
CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  token_type VARCHAR(50) NOT NULL, -- 'marketing', 'all', 'transactional', 'management'
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON unsubscribe_tokens(token);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_email ON unsubscribe_tokens(email);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_expires ON unsubscribe_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for unsubscribe_tokens
-- Public read for unsubscribe validation
CREATE POLICY "Public read for unsubscribe validation"
ON unsubscribe_tokens
FOR SELECT
USING (true);

-- System can insert tokens
CREATE POLICY "Service can insert unsubscribe tokens"
ON unsubscribe_tokens
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- System can update tokens (mark as used)
CREATE POLICY "Service can update unsubscribe tokens"
ON unsubscribe_tokens
FOR UPDATE
USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Add constraint for valid token types
ALTER TABLE unsubscribe_tokens
DROP CONSTRAINT IF EXISTS chk_token_type;
ALTER TABLE unsubscribe_tokens
ADD CONSTRAINT chk_token_type
CHECK (
  token_type IN (
    'marketing',
    'all',
    'transactional',
    'management'
  )
);

-- Add comments for documentation
COMMENT ON TABLE unsubscribe_tokens IS 'Tokens for one-click unsubscribe and preference management';
COMMENT ON COLUMN unsubscribe_tokens.token_type IS 'Type: marketing (unsub from marketing only), all (unsub from all emails), transactional (unsub from order emails), management (manage preferences)';
COMMENT ON COLUMN unsubscribe_tokens.expires_at IS 'Token expiration time - typically 7-30 days';

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_unsubscribe_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM unsubscribe_tokens
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

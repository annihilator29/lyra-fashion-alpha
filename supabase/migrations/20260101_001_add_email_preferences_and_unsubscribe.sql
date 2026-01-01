-- Migration: Add email preferences defaults and unsubscribe tokens
-- Epic 4, Story 4.5 - Email Notifications & Marketing Preferences
-- This migration updates email preferences with proper defaults and creates unsubscribe tokens table

-- Step 1: Update email_preferences column with proper default values
-- The column already exists from Story 4.2, but needs structured defaults
ALTER TABLE customers
ALTER COLUMN email_preferences
SET DEFAULT '{"order_updates": true, "new_products": false, "sales": false, "blog": false}'::jsonb;

-- Step 2: Update existing NULL values to proper defaults
UPDATE customers
SET email_preferences = '{"order_updates": true, "new_products": false, "sales": false, "blog": false}'::jsonb
WHERE email_preferences IS NULL;

-- Step 3: Add GIN index for email preference queries (for segmentation)
CREATE INDEX IF NOT EXISTS idx_customers_email_preferences
ON customers USING GIN (email_preferences);

-- Step 4: Create unsubscribe_tokens table for one-click unsubscribe
CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  token_type VARCHAR(50) NOT NULL, -- 'marketing', 'all', 'transactional'
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 5: Add indices for unsubscribe_tokens performance
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token
ON unsubscribe_tokens(token);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_email
ON unsubscribe_tokens(email);

-- Step 6: Create index for expired token cleanup
CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_expires
ON unsubscribe_tokens(expires_at);

-- Step 7: Enable RLS on unsubscribe_tokens
ALTER TABLE unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

-- Step 8: RLS Policies for unsubscribe_tokens
-- Public read for unsubscribe validation (one-click unsubscribe links)
DROP POLICY IF EXISTS "Public read for unsubscribe validation" ON unsubscribe_tokens;
CREATE POLICY "Public read for unsubscribe validation"
  ON unsubscribe_tokens
  FOR SELECT
  USING (true); -- Public access for unsubscribe endpoint validation

-- System can insert tokens (authenticated users or service role)
DROP POLICY IF EXISTS "System can insert tokens" ON unsubscribe_tokens;
CREATE POLICY "System can insert tokens"
  ON unsubscribe_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- System can update tokens (mark as used)
DROP POLICY IF EXISTS "System can update tokens" ON unsubscribe_tokens;
CREATE POLICY "System can update tokens"
  ON unsubscribe_tokens
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Step 9: Update RLS policies for customers to allow email preference updates
-- (RLS already enabled from Story 4.1)

DROP POLICY IF EXISTS "Users can view own email preferences" ON customers;
CREATE POLICY "Users can view own email preferences"
  ON customers
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own email preferences" ON customers;
CREATE POLICY "Users can update own email preferences"
  ON customers
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add comments for documentation
COMMENT ON COLUMN customers.email_preferences IS 'Email marketing preferences with granular control: order_updates (default true), new_products, sales, blog (all default false)';
COMMENT ON TABLE unsubscribe_tokens IS 'One-click unsubscribe tokens for CAN-SPAM compliance';
COMMENT ON COLUMN unsubscribe_tokens.token_type IS 'Type: "marketing" (unsub from marketing only), "all" (unsub from all emails), "transactional" (unsub from transactional only)';
COMMENT ON COLUMN unsubscribe_tokens.expires_at IS 'Token expiration (7-30 days) for security';

-- Note: Token expiration should be managed by background job
-- Recommended cleanup: DELETE FROM unsubscribe_tokens WHERE expires_at < NOW();

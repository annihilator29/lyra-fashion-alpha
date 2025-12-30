-- Migration: Add profile preferences and phone to customers table
-- Epic 4, Story 4.2 - Customer Profile & Preferences
-- Note: 'preferences' column already exists from Story 4.1

-- Add phone_number column for customer phone
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add avatar_url column for profile avatar image
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add email_preferences JSONB column for email marketing preferences
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT NULL;

-- Create index on phone_number for potential queries (only if index doesn't exist)
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);

-- Update RLS policies to allow users to update their own profile
-- (RLS should already be enabled on customers from Story 4.1)

DROP POLICY IF EXISTS "Users can update own profile" ON customers;

CREATE POLICY "Users can update own profile"
  ON customers
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Comments for documentation
COMMENT ON COLUMN customers.phone_number IS 'Customer phone number, validated with libphonenumber-js';
COMMENT ON COLUMN customers.avatar_url IS 'URL to customer avatar image stored in Supabase Storage';
COMMENT ON COLUMN customers.email_preferences IS 'Email marketing preferences: order_updates, marketing, new_products';

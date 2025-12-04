-- Migration: Create customers table
-- Epic 1, Story 1.3 - Database Schema & Core API Setup
-- Table: customers - Extends Supabase Auth users with profile data

-- Create customers table (extends auth.users)
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  preferences JSONB,  -- Shopping preferences, style profile
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_customers_email ON customers(email);

-- Create trigger for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE customers IS 'Customer profiles extending Supabase Auth users';
COMMENT ON COLUMN customers.preferences IS 'JSONB for shopping preferences and style profile';

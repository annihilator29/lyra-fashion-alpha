-- Migration: Create shipping addresses table
-- Epic 4, Story 4.2 - Customer Profile & Preferences
-- Table: shipping_addresses - Store customer shipping addresses

-- Create shipping_addresses table
CREATE TABLE shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Home", "Office"
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US', -- ISO country code, default to US
  phone TEXT, -- Optional phone for the address
  is_default BOOLEAN DEFAULT false, -- Default address for checkout
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast queries on customer_id
CREATE INDEX idx_shipping_addresses_customer_id ON shipping_addresses(customer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only view/edit their own addresses
CREATE POLICY "Users can view own addresses"
  ON shipping_addresses
  FOR SELECT
  USING (customer_id IN (SELECT id FROM customers WHERE id = auth.uid()));

CREATE POLICY "Users can insert own addresses"
  ON shipping_addresses
  FOR INSERT
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE id = auth.uid()));

CREATE POLICY "Users can update own addresses"
  ON shipping_addresses
  FOR UPDATE
  USING (customer_id IN (SELECT id FROM customers WHERE id = auth.uid()))
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE id = auth.uid()));

CREATE POLICY "Users can delete own addresses"
  ON shipping_addresses
  FOR DELETE
  USING (customer_id IN (SELECT id FROM customers WHERE id = auth.uid()));

-- Comments for documentation
COMMENT ON TABLE shipping_addresses IS 'Customer shipping addresses linked to customers table';
COMMENT ON COLUMN shipping_addresses.name IS 'Label for address (e.g., Home, Office)';
COMMENT ON COLUMN shipping_addresses.country IS 'ISO country code, defaults to US';
COMMENT ON COLUMN shipping_addresses.is_default IS 'Default address for checkout';

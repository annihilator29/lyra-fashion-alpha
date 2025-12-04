-- Migration: Create orders table
-- Epic 1, Story 1.3 - Database Schema & Core API Setup
-- Table: orders - Customer order records with status tracking

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),  -- NULL allowed for guest checkout
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, production, shipped, delivered
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE orders IS 'Customer order records for Lyra Fashion';
COMMENT ON COLUMN orders.status IS 'Order status: pending, production, shipped, delivered';
COMMENT ON COLUMN orders.shipping_address IS 'JSONB containing shipping address details';

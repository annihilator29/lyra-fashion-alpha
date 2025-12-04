-- Migration: Create inventory table
-- Epic 1, Story 1.3 - Database Schema & Core API Setup
-- Table: inventory - Stock tracking with production status

-- Create inventory table
CREATE TABLE inventory (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,  -- Items in active carts
  production_status TEXT,  -- ordered, cutting, sewing, quality_check, ready
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for production status queries
CREATE INDEX idx_inventory_production_status ON inventory(production_status);

-- Create trigger for updated_at
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE inventory IS 'Stock levels and production status tracking';
COMMENT ON COLUMN inventory.reserved IS 'Items currently reserved in active shopping carts';
COMMENT ON COLUMN inventory.production_status IS 'Production stage: ordered, cutting, sewing, quality_check, ready';

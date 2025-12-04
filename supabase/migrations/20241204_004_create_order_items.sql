-- Migration: Create order_items table
-- Epic 1, Story 1.3 - Database Schema & Core API Setup
-- Table: order_items - Line items for orders with CASCADE delete

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,  -- Price at time of purchase
  variant JSONB,  -- Size, color selection
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

COMMENT ON TABLE order_items IS 'Line items for orders with variant details';
COMMENT ON COLUMN order_items.price IS 'Price at time of purchase (historical)';
COMMENT ON COLUMN order_items.variant IS 'JSONB containing size, color, and other variant options';

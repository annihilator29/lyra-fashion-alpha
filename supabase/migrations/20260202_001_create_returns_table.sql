-- Migration: Create returns table
-- Epic 6, Story 6.4 - Returns & Refunds Processing
-- Table: returns - Customer return requests with status tracking and refund management

-- Create return_status enum type
CREATE TYPE return_status AS ENUM (
  'requested',
  'approved',
  'shipped',
  'received',
  'inspected',
  'refunded',
  'rejected'
);

-- Create return_reason enum type
CREATE TYPE return_reason AS ENUM (
  'size_fit',
  'quality_issue',
  'changed_mind',
  'damaged',
  'other'
);

-- Create returns table
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  order_item_ids UUID[] NOT NULL, -- Array of order_item IDs being returned
  
  -- Return details
  reason return_reason NOT NULL,
  condition_notes TEXT,
  
  -- Status tracking
  status return_status NOT NULL DEFAULT 'requested',
  
  -- Authorization
  rma_number TEXT NOT NULL UNIQUE, -- Format: RMA-{order_id}-{timestamp}
  
  -- Shipping
  shipping_label_url TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  
  -- Financial
  refund_amount DECIMAL(10,2) NOT NULL,
  stripe_refund_id TEXT,
  
  -- Inspection
  inspection_notes TEXT,
  inspection_photos TEXT[], -- Array of Supabase Storage URLs
  inspected_at TIMESTAMPTZ,
  inspected_by UUID REFERENCES profiles(id),
  
  -- Rejection details
  rejection_reason TEXT,
  
  -- Timestamps for each status
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  -- Meta timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_returns_order_id ON returns(order_id);
CREATE INDEX idx_returns_status ON returns(status);
CREATE INDEX idx_returns_rma_number ON returns(rma_number);
CREATE INDEX idx_returns_customer_lookup ON returns(order_id, status);
CREATE INDEX idx_returns_created_at ON returns(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_returns_updated_at
  BEFORE UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to prevent duplicate returns for the same order items
CREATE OR REPLACE FUNCTION check_duplicate_return_items()
RETURNS TRIGGER AS $$
DECLARE
  existing_return_id UUID;
  overlapping_items UUID[];
BEGIN
  -- Find any existing returns that share items with this new return
  SELECT r.id, ARRAY(
    SELECT UNNEST(r.order_item_ids)
    INTERSECT
    SELECT UNNEST(NEW.order_item_ids)
  )
  INTO existing_return_id, overlapping_items
  FROM returns r
  WHERE r.order_id = NEW.order_id
    AND r.status NOT IN ('rejected')
    AND r.id != NEW.id
    AND r.order_item_ids && NEW.order_item_ids; -- Overlapping array elements
  
  IF existing_return_id IS NOT NULL THEN
    RAISE EXCEPTION 'Items already in another return: %', overlapping_items
      USING ERRCODE = 'P0001';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check for duplicate returns
CREATE TRIGGER prevent_duplicate_return_items
  BEFORE INSERT OR UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_return_items();

-- Enable RLS
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Customers can view returns for their own orders
CREATE POLICY "Users can view returns for own orders" ON returns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = returns.order_id 
      AND orders.customer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Customers can create returns for their own orders
CREATE POLICY "Users can create returns for own orders" ON returns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = returns.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- RLS Policy: Only admins can update return status (approve, inspect, refund)
CREATE POLICY "Only admins can update returns" ON returns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policy: Only admins can delete returns
CREATE POLICY "Only admins can delete returns" ON returns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE returns IS 'Customer return requests with full lifecycle tracking';
COMMENT ON COLUMN returns.order_item_ids IS 'Array of order_item IDs being returned - prevents duplicate returns via trigger';
COMMENT ON COLUMN returns.rma_number IS 'Return Merchandise Authorization number, format: RMA-{order_id}-{timestamp}';
COMMENT ON COLUMN returns.refund_amount IS 'Full item price (100% - no restocking fees per industry standard)';
COMMENT ON COLUMN returns.inspection_photos IS 'Array of Supabase Storage URLs for inspection documentation';

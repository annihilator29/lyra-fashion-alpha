-- Migration: Add Order Status Timestamps and Production Stages
-- Epic 4, Story 4.3 - Order History & Tracking
-- Description: Add timestamp columns for each order status and detailed production tracking

-- Add status timestamp columns to orders table
ALTER TABLE orders
ADD COLUMN ordered_at TIMESTAMPTZ,
ADD COLUMN production_started_at TIMESTAMPTZ,
ADD COLUMN quality_checked_at TIMESTAMPTZ,
ADD COLUMN shipped_at TIMESTAMPTZ,
ADD COLUMN delivered_at TIMESTAMPTZ;

-- Add production_stages JSONB column for detailed tracking
ALTER TABLE orders
ADD COLUMN production_stages JSONB DEFAULT NULL;

-- Add tracking number and carrier columns
ALTER TABLE orders
ADD COLUMN tracking_number TEXT,
ADD COLUMN carrier TEXT;

-- Update status column to include new statuses
-- Note: This is a text column, so we can extend the valid values
-- Valid statuses: pending, production, quality_check, shipped, delivered, cancelled

-- Create index on tracking number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Create index on shipped_at for order fulfillment tracking
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON orders(shipped_at);

-- Comments for new columns
COMMENT ON COLUMN orders.ordered_at IS 'Timestamp when order was received';
COMMENT ON COLUMN orders.production_started_at IS 'Timestamp when production started';
COMMENT ON COLUMN orders.quality_checked_at IS 'Timestamp when quality check completed';
COMMENT ON COLUMN orders.shipped_at IS 'Timestamp when order was shipped';
COMMENT ON COLUMN orders.delivered_at IS 'Timestamp when order was delivered';
COMMENT ON COLUMN orders.production_stages IS 'JSONB detailed production tracking: {cutting, sewing, finishing, qc}';
COMMENT ON COLUMN orders.tracking_number IS 'Tracking number from shipping carrier';
COMMENT ON COLUMN orders.carrier IS 'Shipping carrier: usps, ups, fedex, dhl';

-- RLS Policy for orders: Customers can only see their own orders
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;

CREATE POLICY "Customers can view own orders"
ON orders
FOR SELECT
USING (auth.uid() = customer_id);

-- Enable RLS on orders table (if not already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

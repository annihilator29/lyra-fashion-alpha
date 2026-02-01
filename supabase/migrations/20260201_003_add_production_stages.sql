-- Migration: Add production tracking columns to orders table
-- Story 6.3 - Production Status Communication
-- Date: 2026-02-01

-- Add production_completion_estimate column for estimated completion dates (AC-2)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS production_completion_estimate TIMESTAMPTZ;

-- Add qc_photo_url column for optional QC photos (AC-4)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS qc_photo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.production_completion_estimate IS 'Estimated completion date for all production stages';
COMMENT ON COLUMN orders.qc_photo_url IS 'URL to quality control photo of completed item (optional)';

-- Create index for filtering orders by production status (performance optimization)
CREATE INDEX IF NOT EXISTS idx_orders_production_completion_estimate 
ON orders(production_completion_estimate) 
WHERE production_completion_estimate IS NOT NULL;

-- Create index for orders with QC photos
CREATE INDEX IF NOT EXISTS idx_orders_qc_photo 
ON orders(qc_photo_url) 
WHERE qc_photo_url IS NOT NULL;

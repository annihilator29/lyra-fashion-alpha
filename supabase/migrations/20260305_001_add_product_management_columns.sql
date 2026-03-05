-- Migration: Add product management columns for Story 7.2
-- Created: 2026-03-05
-- Description: Adds status, compare_at_price, cost, meta fields, and tags to products table

-- ============================================
-- Task 1: Add missing columns to products table
-- ============================================

-- Add status column (default to 'draft' for existing products)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add compare_at_price for sales
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10,2);

-- Add cost for margin calculations
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2);

-- Add meta title for SEO
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

-- Add meta description for SEO
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add tags array for filtering
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ============================================
-- Task 2: Create indexes for performance
-- ============================================

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Index for category + status filtering
CREATE INDEX IF NOT EXISTS idx_products_status_category ON products(status, category);

-- Note: trigram index requires pg_trgm extension to be enabled first
-- CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

-- ============================================
-- Task 3: Update existing products
-- ============================================

-- Set default status for existing products
UPDATE products 
SET status = 'active' 
WHERE status IS NULL;

-- Set default tags for existing products
UPDATE products 
SET tags = '{}' 
WHERE tags IS NULL;

-- ============================================
-- Task 4: Add comments for documentation
-- ============================================

COMMENT ON COLUMN products.status IS 'Product visibility: draft (hidden), active (live), archived (hidden but retained)';
COMMENT ON COLUMN products.compare_at_price IS 'Original price for sales comparison';
COMMENT ON COLUMN products.cost IS 'Product cost for margin calculations';
COMMENT ON COLUMN products.meta_title IS 'SEO meta title (50-60 characters)';
COMMENT ON COLUMN products.meta_description IS 'SEO meta description (150-160 characters)';
COMMENT ON COLUMN products.tags IS 'Array of tags for filtering and organization';

-- ============================================
-- Task 5: Verify the changes
-- ============================================

-- Check that all columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('status', 'compare_at_price', 'cost', 'meta_title', 'meta_description', 'tags')
ORDER BY ordinal_position;

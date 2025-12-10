-- Migration: Add Full-Text Search to Products
-- Story: 2-3 Product Search with Autocomplete
-- Date: 2025-12-10
--
-- This migration adds PostgreSQL full-text search capabilities to the products table.
-- It creates a search_vector column with weighted relevance for product name, description, and category.

-- Step 1: Add search_vector column (tsvector type for full-text search)
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create GIN index for fast full-text search lookups
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);

-- Step 3: Create trigger function to automatically update search_vector
-- Weights: A (highest) = name, B = description, C = category
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to run function on INSERT or UPDATE
DROP TRIGGER IF EXISTS products_search_vector_trigger ON products;
CREATE TRIGGER products_search_vector_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

-- Step 5: Backfill existing products with search vectors
UPDATE products SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'C')
WHERE search_vector IS NULL;

-- Verification query (run to test):
-- SELECT name, ts_rank(search_vector, to_tsquery('english', 'dress')) as rank
-- FROM products
-- WHERE search_vector @@ to_tsquery('english', 'dress')
-- ORDER BY rank DESC;

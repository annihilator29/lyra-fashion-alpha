-- Update all product images to use Supabase Storage URLs
-- Replaces '/images/' with the full Supabase Storage URL prefix
-- Project Ref: pexsipchcidsoqydigbt

UPDATE products 
SET images = ARRAY(
  SELECT REPLACE(unnest(images), '/images/', 'https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/')
);

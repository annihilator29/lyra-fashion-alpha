-- =====================================================
-- Migration: Create product_variants table and seed data
-- Run this directly in Supabase SQL Editor
-- =====================================================

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    size VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7),
    price_modifier DECIMAL(10, 2) DEFAULT 0,
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Enable RLS on product_variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create it
DROP POLICY IF EXISTS "Allow public read access to product_variants" ON product_variants;
CREATE POLICY "Allow public read access to product_variants"
    ON product_variants
    FOR SELECT
    TO public
    USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_variants_updated_at ON product_variants;
CREATE TRIGGER product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_product_variants_updated_at();

-- =====================================================
-- SEED DATA: Product Variants
-- =====================================================

-- Helper: Get product IDs by slug for reference
-- We'll use subqueries to get the product_id dynamically

-- Knit Bodycon Dress variants (knit-bodycon-dress)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-XS-BLK', 'XS', 'Black', '#000000', 0, 15),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-S-BLK', 'S', 'Black', '#000000', 0, 25),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-M-BLK', 'M', 'Black', '#000000', 0, 30),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-L-BLK', 'L', 'Black', '#000000', 0, 20),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-XL-BLK', 'XL', 'Black', '#000000', 0, 10),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-XS-BURG', 'XS', 'Burgundy', '#800020', 5, 8),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-S-BURG', 'S', 'Burgundy', '#800020', 5, 12),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-M-BURG', 'M', 'Burgundy', '#800020', 5, 18),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-L-BURG', 'L', 'Burgundy', '#800020', 5, 10),
    ((SELECT id FROM products WHERE slug = 'knit-bodycon-dress'), 'KBD-XL-BURG', 'XL', 'Burgundy', '#800020', 5, 5);

-- Silk Midi Dress variants (silk-midi-dress)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-XS-ROSE', 'XS', 'Rose', '#E8B4B8', 0, 10),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-S-ROSE', 'S', 'Rose', '#E8B4B8', 0, 20),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-M-ROSE', 'M', 'Rose', '#E8B4B8', 0, 25),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-L-ROSE', 'L', 'Rose', '#E8B4B8', 0, 15),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-XL-ROSE', 'XL', 'Rose', '#E8B4B8', 0, 8),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-XS-NAVY', 'XS', 'Navy', '#1E3A5F', 0, 12),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-S-NAVY', 'S', 'Navy', '#1E3A5F', 0, 18),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-M-NAVY', 'M', 'Navy', '#1E3A5F', 0, 22),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-L-NAVY', 'L', 'Navy', '#1E3A5F', 0, 14),
    ((SELECT id FROM products WHERE slug = 'silk-midi-dress'), 'SMD-XL-NAVY', 'XL', 'Navy', '#1E3A5F', 0, 0);

-- Cotton Maxi Dress variants (cotton-maxi-dress)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-XS-WHT', 'XS', 'White', '#FFFFFF', 0, 8),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-S-WHT', 'S', 'White', '#FFFFFF', 0, 15),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-M-WHT', 'M', 'White', '#FFFFFF', 0, 20),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-L-WHT', 'L', 'White', '#FFFFFF', 0, 12),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-XL-WHT', 'XL', 'White', '#FFFFFF', 0, 6),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-XS-TERR', 'XS', 'Terracotta', '#E2725B', 10, 5),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-S-TERR', 'S', 'Terracotta', '#E2725B', 10, 10),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-M-TERR', 'M', 'Terracotta', '#E2725B', 10, 15),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-L-TERR', 'L', 'Terracotta', '#E2725B', 10, 8),
    ((SELECT id FROM products WHERE slug = 'cotton-maxi-dress'), 'CMD-XL-TERR', 'XL', 'Terracotta', '#E2725B', 10, 3);

-- Linen Wrap Dress variants (linen-wrap-dress)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-XS-NAT', 'XS', 'Natural', '#E8DCC8', 0, 10),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-S-NAT', 'S', 'Natural', '#E8DCC8', 0, 18),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-M-NAT', 'M', 'Natural', '#E8DCC8', 0, 22),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-L-NAT', 'L', 'Natural', '#E8DCC8', 0, 15),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-XL-NAT', 'XL', 'Natural', '#E8DCC8', 0, 8),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-XS-SAGE', 'XS', 'Sage', '#A3B18A', 0, 7),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-S-SAGE', 'S', 'Sage', '#A3B18A', 0, 14),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-M-SAGE', 'M', 'Sage', '#A3B18A', 0, 18),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-L-SAGE', 'L', 'Sage', '#A3B18A', 0, 10),
    ((SELECT id FROM products WHERE slug = 'linen-wrap-dress'), 'LWD-XL-SAGE', 'XL', 'Sage', '#A3B18A', 0, 4);

-- Organic Cotton Dress variants (organic-cotton-dress)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-XS-RUST', 'XS', 'Rust', '#B7410E', 0, 6),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-S-RUST', 'S', 'Rust', '#B7410E', 0, 12),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-M-RUST', 'M', 'Rust', '#B7410E', 0, 18),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-L-RUST', 'L', 'Rust', '#B7410E', 0, 10),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-XL-RUST', 'XL', 'Rust', '#B7410E', 0, 5),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-XS-INDG', 'XS', 'Indigo', '#3F5277', 0, 4),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-S-INDG', 'S', 'Indigo', '#3F5277', 0, 8),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-M-INDG', 'M', 'Indigo', '#3F5277', 0, 12),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-L-INDG', 'L', 'Indigo', '#3F5277', 0, 6),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-dress'), 'OCD-XL-INDG', 'XL', 'Indigo', '#3F5277', 0, 2);

-- Linen Summer Blouse variants (linen-summer-blouse)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-XS-WHT', 'XS', 'White', '#FFFFFF', 0, 15),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-S-WHT', 'S', 'White', '#FFFFFF', 0, 25),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-M-WHT', 'M', 'White', '#FFFFFF', 0, 30),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-L-WHT', 'L', 'White', '#FFFFFF', 0, 20),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-XL-WHT', 'XL', 'White', '#FFFFFF', 0, 12),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-XS-SKY', 'XS', 'Sky Blue', '#87CEEB', 0, 10),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-S-SKY', 'S', 'Sky Blue', '#87CEEB', 0, 18),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-M-SKY', 'M', 'Sky Blue', '#87CEEB', 0, 22),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-L-SKY', 'L', 'Sky Blue', '#87CEEB', 0, 15),
    ((SELECT id FROM products WHERE slug = 'linen-summer-blouse'), 'LSB-XL-SKY', 'XL', 'Sky Blue', '#87CEEB', 0, 8);

-- Sustainable Denim Jeans variants (sustainable-denim-jeans)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-26-MED', '26', 'Medium Wash', '#5B7F95', 0, 12),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-28-MED', '28', 'Medium Wash', '#5B7F95', 0, 20),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-30-MED', '30', 'Medium Wash', '#5B7F95', 0, 25),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-32-MED', '32', 'Medium Wash', '#5B7F95', 0, 20),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-34-MED', '34', 'Medium Wash', '#5B7F95', 0, 15),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-26-DRK', '26', 'Dark Wash', '#1A3047', 0, 8),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-28-DRK', '28', 'Dark Wash', '#1A3047', 0, 15),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-30-DRK', '30', 'Dark Wash', '#1A3047', 0, 18),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-32-DRK', '32', 'Dark Wash', '#1A3047', 0, 12),
    ((SELECT id FROM products WHERE slug = 'sustainable-denim-jeans'), 'SDJ-34-DRK', '34', 'Dark Wash', '#1A3047', 0, 6);

-- Merino Wool Cardigan variants (merino-wool-cardigan)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-XS-OAT', 'XS', 'Oatmeal', '#D4C4B5', 0, 8),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-S-OAT', 'S', 'Oatmeal', '#D4C4B5', 0, 15),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-M-OAT', 'M', 'Oatmeal', '#D4C4B5', 0, 20),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-L-OAT', 'L', 'Oatmeal', '#D4C4B5', 0, 12),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-XL-OAT', 'XL', 'Oatmeal', '#D4C4B5', 0, 6),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-XS-CHAR', 'XS', 'Charcoal', '#36454F', 0, 5),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-S-CHAR', 'S', 'Charcoal', '#36454F', 0, 10),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-M-CHAR', 'M', 'Charcoal', '#36454F', 0, 14),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-L-CHAR', 'L', 'Charcoal', '#36454F', 0, 8),
    ((SELECT id FROM products WHERE slug = 'merino-wool-cardigan'), 'MWC-XL-CHAR', 'XL', 'Charcoal', '#36454F', 0, 3);

-- Handwoven Silk Scarf variants (handwoven-silk-scarf)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'handwoven-silk-scarf'), 'HSS-OS-RUBY', 'One Size', 'Ruby', '#9B111E', 0, 20),
    ((SELECT id FROM products WHERE slug = 'handwoven-silk-scarf'), 'HSS-OS-EMRLD', 'One Size', 'Emerald', '#50C878', 0, 15),
    ((SELECT id FROM products WHERE slug = 'handwoven-silk-scarf'), 'HSS-OS-SAPH', 'One Size', 'Sapphire', '#0F52BA', 0, 18),
    ((SELECT id FROM products WHERE slug = 'handwoven-silk-scarf'), 'HSS-OS-GOLD', 'One Size', 'Gold', '#FFD700', 15, 10),
    ((SELECT id FROM products WHERE slug = 'handwoven-silk-scarf'), 'HSS-OS-IVORY', 'One Size', 'Ivory', '#FFFFF0', 0, 25);

-- Cashmere Turtleneck variants (cashmere-turtleneck)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, price_modifier, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-XS-CAML', 'XS', 'Camel', '#C19A6B', 0, 6),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-S-CAML', 'S', 'Camel', '#C19A6B', 0, 12),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-M-CAML', 'M', 'Camel', '#C19A6B', 0, 15),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-L-CAML', 'L', 'Camel', '#C19A6B', 0, 10),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-XL-CAML', 'XL', 'Camel', '#C19A6B', 0, 5),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-XS-BLK', 'XS', 'Black', '#000000', 0, 8),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-S-BLK', 'S', 'Black', '#000000', 0, 15),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-M-BLK', 'M', 'Black', '#000000', 0, 18),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-L-BLK', 'L', 'Black', '#000000', 0, 12),
    ((SELECT id FROM products WHERE slug = 'cashmere-turtleneck'), 'CTN-XL-BLK', 'XL', 'Black', '#000000', 0, 4);

-- =====================================================
-- ADDITIONAL VARIANTS FOR REMAINING PRODUCTS
-- =====================================================

-- Accessories (One Size fits all)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'linen-bucket-hat'), 'LBH-OS-NAT', 'One Size', 'Natural', '#E8DCC8', 30),
    ((SELECT id FROM products WHERE slug = 'linen-bucket-hat'), 'LBH-OS-BLK', 'One Size', 'Black', '#000000', 25),
    ((SELECT id FROM products WHERE slug = 'cashmere-beanie'), 'CBN-OS-GRY', 'One Size', 'Grey', '#808080',20),
    ((SELECT id FROM products WHERE slug = 'cashmere-beanie'), 'CBN-OS-BLK', 'One Size', 'Black', '#000000', 18),
    ((SELECT id FROM products WHERE slug = 'leather-card-holder'), 'LCH-OS-TAN', 'One Size', 'Tan', '#D2B48C', 15),
    ((SELECT id FROM products WHERE slug = 'leather-card-holder'), 'LCH-OS-BLK', 'One Size', 'Black', '#000000', 20),
    ((SELECT id FROM products WHERE slug = 'leather-tote-bag'), 'LTB-OS-BRN', 'One Size', 'Brown', '#8B4513', 12),
    ((SELECT id FROM products WHERE slug = 'leather-tote-bag'), 'LTB-OS-BLK', 'One Size', 'Black', '#000000', 10),
    ((SELECT id FROM products WHERE slug = 'wool-fedora'), 'WF-OS-BLK', 'One Size', 'Black', '#000000', 15),
    ((SELECT id FROM products WHERE slug = 'wool-fedora'), 'WF-OS-TAN', 'One Size', 'Tan', '#D2B48C', 18),
    ((SELECT id FROM products WHERE slug = 'woven-belt'), 'WB-OS-NAT', 'One Size', 'Natural', '#E8DCC8', 25),
    ((SELECT id FROM products WHERE slug = 'woven-belt'), 'WB-OS-BLK', 'One Size', 'Black', '#000000', 20),
    ((SELECT id FROM products WHERE slug = 'canvas-weekender'), 'CW-OS-OLIVE', 'One Size', 'Olive', '#556B2F', 8),
    ((SELECT id FROM products WHERE slug = 'canvas-weekender'), 'CW-OS-NAVY', 'One Size', 'Navy', '#1E3A5F', 10),
    ((SELECT id FROM products WHERE slug = 'silk-eye-mask'), 'SEM-OS-BLK', 'One Size', 'Black', '#000000', 30),
    ((SELECT id FROM products WHERE slug = 'silk-eye-mask'), 'SEM-OS-NAVY', 'One Size', 'Navy', '#1E3A5F', 25),
    ((SELECT id FROM products WHERE slug = 'pearl-drop-earrings'), 'PDE-OS-GOLD', 'One Size', 'Gold', '#FFD700', 20),
    ((SELECT id FROM products WHERE slug = 'pearl-drop-earrings'), 'PDE-OS-SLVR', 'One Size', 'Silver', '#C0C0C0', 18);

-- Tops (XS-XL sizing)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'organic-cotton-tee'), 'OCT-XS-WHT', 'XS', 'White', '#FFFFFF', 20),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-tee'), 'OCT-S-WHT', 'S', 'White', '#FFFFFF', 30),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-tee'), 'OCT-M-WHT', 'M', 'White', '#FFFFFF', 35),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-tee'), 'OCT-L-WHT', 'L', 'White', '#FFFFFF', 25),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-tee'), 'OCT-XL-WHT', 'XL', 'White', '#FFFFFF', 15),
    ((SELECT id FROM products WHERE slug = 'linen-button-up'), 'LBU-XS-WHT', 'XS', 'White', '#FFFFFF', 12),
    ((SELECT id FROM products WHERE slug = 'linen-button-up'), 'LBU-S-WHT', 'S', 'White', '#FFFFFF', 18),
    ((SELECT id FROM products WHERE slug = 'linen-button-up'), 'LBU-M-WHT', 'M', 'White', '#FFFFFF', 22),
    ((SELECT id FROM products WHERE slug = 'linen-button-up'), 'LBU-L-WHT', 'L', 'White', '#FFFFFF', 16),
    ((SELECT id FROM products WHERE slug = 'linen-button-up'), 'LBU-XL-WHT', 'XL', 'White', '#FFFFFF', 10),
    ((SELECT id FROM products WHERE slug = 'cropped-cardigan'), 'CC-XS-CRMY', 'XS', 'Cream', '#F5F5DC', 10),
    ((SELECT id FROM products WHERE slug = 'cropped-cardigan'), 'CC-S-CRMY', 'S', 'Cream', '#F5F5DC', 15),
    ((SELECT id FROM products WHERE slug = 'cropped-cardigan'), 'CC-M-CRMY', 'M', 'Cream', '#F5F5DC', 20),
    ((SELECT id FROM products WHERE slug = 'cropped-cardigan'), 'CC-L-CRMY', 'L', 'Cream', '#F5F5DC', 12),
    ((SELECT id FROM products WHERE slug = 'cropped-cardigan'), 'CC-XL-CRMY', 'XL', 'Cream', '#F5F5DC', 8),
    ((SELECT id FROM products WHERE slug = 'embroidered-peasant-top'), 'EPT-XS-WHT', 'XS', 'White', '#FFFFFF', 8),
    ((SELECT id FROM products WHERE slug = 'embroidered-peasant-top'), 'EPT-S-WHT', 'S', 'White', '#FFFFFF', 14),
    ((SELECT id FROM products WHERE slug = 'embroidered-peasant-top'), 'EPT-M-WHT', 'M', 'White', '#FFFFFF', 18),
    ((SELECT id FROM products WHERE slug = 'embroidered-peasant-top'), 'EPT-L-WHT', 'L', 'White', '#FFFFFF', 12),
    ((SELECT id FROM products WHERE slug = 'embroidered-peasant-top'), 'EPT-XL-WHT', 'XL', 'White', '#FFFFFF', 6),
    ((SELECT id FROM products WHERE slug = 'silk-camisole'), 'SC-XS-BLK', 'XS', 'Black', '#000000', 12),
    ((SELECT id FROM products WHERE slug = 'silk-camisole'), 'SC-S-BLK', 'S', 'Black', '#000000', 18),
    ((SELECT id FROM products WHERE slug = 'silk-camisole'), 'SC-M-BLK', 'M', 'Black', '#000000', 20),
    ((SELECT id FROM products WHERE slug = 'silk-camisole'), 'SC-L-BLK', 'L', 'Black', '#000000', 14),
    ((SELECT id FROM products WHERE slug = 'silk-camisole'), 'SC-XL-BLK', 'XL', 'Black', '#000000', 8),
    ((SELECT id FROM products WHERE slug = 'wool-blend-sweater'), 'WBS-XS-GREY', 'XS', 'Grey', '#808080', 10),
    ((SELECT id FROM products WHERE slug = 'wool-blend-sweater'), 'WBS-S-GREY', 'S', 'Grey', '#808080', 16),
    ((SELECT id FROM products WHERE slug = 'wool-blend-sweater'), 'WBS-M-GREY', 'M', 'Grey', '#808080', 20),
    ((SELECT id FROM products WHERE slug = 'wool-blend-sweater'), 'WBS-L-GREY', 'L', 'Grey', '#808080', 14),
    ((SELECT id FROM products WHERE slug = 'wool-blend-sweater'), 'WBS-XL-GREY', 'XL', 'Grey', '#808080', 8),
    ((SELECT id FROM products WHERE slug = 'ribbed-tank-top'), 'RTT-XS-WHT', 'XS', 'White', '#FFFFFF', 25),
    ((SELECT id FROM products WHERE slug = 'ribbed-tank-top'), 'RTT-S-WHT', 'S', 'White', '#FFFFFF', 35),
    ((SELECT id FROM products WHERE slug = 'ribbed-tank-top'), 'RTT-M-WHT', 'M', 'White', '#FFFFFF', 40),
    ((SELECT id FROM products WHERE slug = 'ribbed-tank-top'), 'RTT-L-WHT', 'L', 'White', '#FFFFFF', 30),
    ((SELECT id FROM products WHERE slug = 'ribbed-tank-top'), 'RTT-XL-WHT', 'XL', 'White', '#FFFFFF', 20),
    ((SELECT id FROM products WHERE slug = 'satin-blouse'), 'SB-XS-BLSH', 'XS', 'Blush', '#E8B4B8', 10),
    ((SELECT id FROM products WHERE slug = 'satin-blouse'), 'SB-S-BLSH', 'S', 'Blush', '#E8B4B8', 16),
    ((SELECT id FROM products WHERE slug = 'satin-blouse'), 'SB-M-BLSH', 'M', 'Blush', '#E8B4B8', 20),
    ((SELECT id FROM products WHERE slug = 'satin-blouse'), 'SB-L-BLSH', 'L', 'Blush', '#E8B4B8', 14),
    ((SELECT id FROM products WHERE slug = 'satin-blouse'), 'SB-XL-BLSH', 'XL', 'Blush', '#E8B4B8', 8);

-- Bottoms (sizing varies by type)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'linen-palazzo-pants'), 'LPP-XS-NAT', 'XS', 'Natural', '#E8DCC8', 10),
    ((SELECT id FROM products WHERE slug = 'linen-palazzo-pants'), 'LPP-S-NAT', 'S', 'Natural', '#E8DCC8', 16),
    ((SELECT id FROM products WHERE slug = 'linen-palazzo-pants'), 'LPP-M-NAT', 'M', 'Natural', '#E8DCC8', 20),
    ((SELECT id FROM products WHERE slug = 'linen-palazzo-pants'), 'LPP-L-NAT', 'L', 'Natural', '#E8DCC8', 14),
((SELECT id FROM products WHERE slug = 'linen-palazzo-pants'), 'LPP-XL-NAT', 'XL', 'Natural', '#E8DCC8', 8),
    ((SELECT id FROM products WHERE slug = 'tailored-shorts'), 'TS-XS-BLK', 'XS', 'Black', '#000000', 12),
    ((SELECT id FROM products WHERE slug = 'tailored-shorts'), 'TS-S-BLK', 'S', 'Black', '#000000', 18),
    ((SELECT id FROM products WHERE slug = 'tailored-shorts'), 'TS-M-BLK', 'M', 'Black', '#000000', 22),
    ((SELECT id FROM products WHERE slug = 'tailored-shorts'), 'TS-L-BLK', 'L', 'Black', '#000000', 16),
    ((SELECT id FROM products WHERE slug = 'tailored-shorts'), 'TS-XL-BLK', 'XL', 'Black', '#000000', 10),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-joggers'), 'OCJ-XS-GREY', 'XS', 'Grey', '#808080', 15),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-joggers'), 'OCJ-S-GREY', 'S', 'Grey', '#808080', 22),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-joggers'), 'OCJ-M-GREY', 'M', 'Grey', '#808080', 28),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-joggers'), 'OCJ-L-GREY', 'L', 'Grey', '#808080', 20),
    ((SELECT id FROM products WHERE slug = 'organic-cotton-joggers'), 'OCJ-XL-GREY', 'XL', 'Grey', '#808080', 12),
    ((SELECT id FROM products WHERE slug = 'pleated-midi-skirt'), 'PMS-XS-BLK', 'XS', 'Black', '#000000', 10),
    ((SELECT id FROM products WHERE slug = 'pleated-midi-skirt'), 'PMS-S-BLK', 'S', 'Black', '#000000', 16),
    ((SELECT id FROM products WHERE slug = 'pleated-midi-skirt'), 'PMS-M-BLK', 'M', 'Black', '#000000', 20),
    ((SELECT id FROM products WHERE slug = 'pleated-midi-skirt'), 'PMS-L-BLK', 'L', 'Black', '#000000', 14),
    ((SELECT id FROM products WHERE slug = 'pleated-midi-skirt'), 'PMS-XL-BLK', 'XL', 'Black', '#000000', 8),
    ((SELECT id FROM products WHERE slug = 'a-line-denim-skirt'), 'ALDS-XS-MED', 'XS', 'Medium Wash', '#5B7F95', 12),
    ((SELECT id FROM products WHERE slug = 'a-line-denim-skirt'), 'ALDS-S-MED', 'S', 'Medium Wash', '#5B7F95', 18),
    ((SELECT id FROM products WHERE slug = 'a-line-denim-skirt'), 'ALDS-M-MED', 'M', 'Medium Wash', '#5B7F95', 22),
    ((SELECT id FROM products WHERE slug = 'a-line-denim-skirt'), 'ALDS-L-MED', 'L', 'Medium Wash', '#5B7F95', 16),
    ((SELECT id FROM products WHERE slug = 'a-line-denim-skirt'), 'ALDS-XL-MED', 'XL', 'Medium Wash', '#5B7F95', 10),
    ((SELECT id FROM products WHERE slug = 'wrap-midi-skirt'), 'WMS-XS-NAT', 'XS', 'Natural', '#E8DCC8', 10),
    ((SELECT id FROM products WHERE slug = 'wrap-midi-skirt'), 'WMS-S-NAT', 'S', 'Natural', '#E8DCC8', 16),
    ((SELECT id FROM products WHERE slug = 'wrap-midi-skirt'), 'WMS-M-NAT', 'M', 'Natural', '#E8DCC8', 20),
    ((SELECT id FROM products WHERE slug = 'wrap-midi-skirt'), 'WMS-L-NAT', 'L', 'Natural', '#E8DCC8', 14),
    ((SELECT id FROM products WHERE slug = 'wrap-midi-skirt'), 'WMS-XL-NAT', 'XL', 'Natural', '#E8DCC8', 8),
    ((SELECT id FROM products WHERE slug = 'wide-leg-trousers'), 'WLT-XS-BLK', 'XS', 'Black', '#000000', 10),
    ((SELECT id FROM products WHERE slug = 'wide-leg-trousers'), 'WLT-S-BLK', 'S', 'Black', '#000000', 16),
    ((SELECT id FROM products WHERE slug = 'wide-leg-trousers'), 'WLT-M-BLK', 'M', 'Black', '#000000', 20),
    ((SELECT id FROM products WHERE slug = 'wide-leg-trousers'), 'WLT-L-BLK', 'L', 'Black', '#000000', 14),
    ((SELECT id FROM products WHERE slug = 'wide-leg-trousers'), 'WLT-XL-BLK', 'XL', 'Black', '#000000', 8),
    ((SELECT id FROM products WHERE slug = 'cargo-pants'), 'CP-XS-OLIVE', 'XS', 'Olive', '#556B2F', 12),
    ((SELECT id FROM products WHERE slug = 'cargo-pants'), 'CP-S-OLIVE', 'S', 'Olive', '#556B2F', 18),
    ((SELECT id FROM products WHERE slug = 'cargo-pants'), 'CP-M-OLIVE', 'M', 'Olive', '#556B2F', 22),
    ((SELECT id FROM products WHERE slug = 'cargo-pants'), 'CP-L-OLIVE', 'L', 'Olive', '#556B2F', 16),
    ((SELECT id FROM products WHERE slug = 'cargo-pants'), 'CP-XL-OLIVE', 'XL', 'Olive', '#556B2F', 10),
    ((SELECT id FROM products WHERE slug = 'high-waist-culottes'), 'HWC-XS-NAVY', 'XS', 'Navy', '#1E3A5F', 10),
    ((SELECT id FROM products WHERE slug = 'high-waist-culottes'), 'HWC-S-NAVY', 'S', 'Navy', '#1E3A5F', 16),
    ((SELECT id FROM products WHERE slug = 'high-waist-culottes'), 'HWC-M-NAVY', 'M', 'Navy', '#1E3A5F', 20),
    ((SELECT id FROM products WHERE slug = 'high-waist-culottes'), 'HWC-L-NAVY', 'L', 'Navy', '#1E3A5F', 14),
    ((SELECT id FROM products WHERE slug = 'high-waist-culottes'), 'HWC-XL-NAVY', 'XL', 'Navy', '#1E3A5F', 8);

-- Dresses (XS-XL sizing)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'velvet-evening-dress'), 'VED-XS-EMER', 'XS', 'Emerald', '#50C878', 6),
    ((SELECT id FROM products WHERE slug = 'velvet-evening-dress'), 'VED-S-EMER', 'S', 'Emerald', '#50C878', 10),
    ((SELECT id FROM products WHERE slug = 'velvet-evening-dress'), 'VED-M-EMER', 'M', 'Emerald', '#50C878', 12),
    ((SELECT id FROM products WHERE slug = 'velvet-evening-dress'), 'VED-L-EMER', 'L', 'Emerald', '#50C878', 8),
    ((SELECT id FROM products WHERE slug = 'velvet-evening-dress'), 'VED-XL-EMER', 'XL', 'Emerald', '#50C878', 4),
    ((SELECT id FROM products WHERE slug = 'jersey-wrap-dress'), 'JWD-XS-BLK', 'XS', 'Black', '#000000', 12),
    ((SELECT id FROM products WHERE slug = 'jersey-wrap-dress'), 'JWD-S-BLK', 'S', 'Black', '#000000', 18),
    ((SELECT id FROM products WHERE slug = 'jersey-wrap-dress'), 'JWD-M-BLK', 'M', 'Black', '#000000', 22),
    ((SELECT id FROM products WHERE slug = 'jersey-wrap-dress'), 'JWD-L-BLK', 'L', 'Black', '#000000', 16),
    ((SELECT id FROM products WHERE slug = 'jersey-wrap-dress'), 'JWD-XL-BLK', 'XL', 'Black', '#000000', 10),
    ((SELECT id FROM products WHERE slug = 'pleated-satin-dress'), 'PSD-XS-GLD', 'XS', 'Gold', '#FFD700', 8),
    ((SELECT id FROM products WHERE slug = 'pleated-satin-dress'), 'PSD-S-GLD', 'S', 'Gold', '#FFD700', 12),
    ((SELECT id FROM products WHERE slug = 'pleated-satin-dress'), 'PSD-M-GLD', 'M', 'Gold', '#FFD700', 14),
    ((SELECT id FROM products WHERE slug = 'pleated-satin-dress'), 'PSD-L-GLD', 'L', 'Gold', '#FFD700', 10),
    ((SELECT id FROM products WHERE slug = 'pleated-satin-dress'), 'PSD-XL-GLD', 'XL', 'Gold', '#FFD700', 6),
    ((SELECT id FROM products WHERE slug = 'embroidered-shift-dress'), 'ESD-XS-WHT', 'XS', 'White', '#FFFFFF', 8),
    ((SELECT id FROM products WHERE slug = 'embroidered-shift-dress'), 'ESD-S-WHT', 'S', 'White', '#FFFFFF', 14),
    ((SELECT id FROM products WHERE slug = 'embroidered-shift-dress'), 'ESD-M-WHT', 'M', 'White', '#FFFFFF', 18),
    ((SELECT id FROM products WHERE slug = 'embroidered-shift-dress'), 'ESD-L-WHT', 'L', 'White', '#FFFFFF', 12),
    ((SELECT id FROM products WHERE slug = 'embroidered-shift-dress'), 'ESD-XL-WHT', 'XL', 'White', '#FFFFFF', 6),
    ((SELECT id FROM products WHERE slug = 'tiered-ruffle-dress'), 'TRD-XS-WHT', 'XS', 'White', '#FFFFFF', 10),
    ((SELECT id FROM products WHERE slug = 'tiered-ruffle-dress'), 'TRD-S-WHT', 'S', 'White', '#FFFFFF', 16),
    ((SELECT id FROM products WHERE slug = 'tiered-ruffle-dress'), 'TRD-M-WHT', 'M', 'White', '#FFFFFF', 20),
    ((SELECT id FROM products WHERE slug = 'tiered-ruffle-dress'), 'TRD-L-WHT', 'L', 'White', '#FFFFFF', 14),
    ((SELECT id FROM products WHERE slug = 'tiered-ruffle-dress'), 'TRD-XL-WHT', 'XL', 'White', '#FFFFFF', 8);

-- Outerwear (XS-XL or S-XXL sizing)
INSERT INTO product_variants (product_id, sku, size, color, color_hex, stock_quantity) VALUES
    ((SELECT id FROM products WHERE slug = 'puffer-vest'), 'PV-S-BLK', 'S', 'Black', '#000000', 12),
    ((SELECT id FROM products WHERE slug = 'puffer-vest'), 'PV-M-BLK', 'M', 'Black', '#000000', 18),
    ((SELECT id FROM products WHERE slug = 'puffer-vest'), 'PV-L-BLK', 'L', 'Black', '#000000', 20),
    ((SELECT id FROM products WHERE slug = 'puffer-vest'), 'PV-XL-BLK', 'XL', 'Black', '#000000', 15),
    ((SELECT id FROM products WHERE slug = 'puffer-vest'), 'PV-XXL-BLK', 'XXL', 'Black', '#000000', 10),
    ((SELECT id FROM products WHERE slug = 'trench-coat'), 'TC-XS-TAN', 'XS', 'Tan', '#D2B48C', 6),
    ((SELECT id FROM products WHERE slug = 'trench-coat'), 'TC-S-TAN', 'S', 'Tan', '#D2B48C', 10),
    ((SELECT id FROM products WHERE slug = 'trench-coat'), 'TC-M-TAN', 'M', 'Tan', '#D2B48C', 12),
    ((SELECT id FROM products WHERE slug = 'trench-coat'), 'TC-L-TAN', 'L', 'Tan', '#D2B48C', 8),
    ((SELECT id FROM products WHERE slug = 'trench-coat'), 'TC-XL-TAN', 'XL', 'Tan', '#D2B48C', 4),
    ((SELECT id FROM products WHERE slug = 'suede-moto-jacket'), 'SMJ-S-BRN', 'S', 'Brown', '#8B4513', 6),
    ((SELECT id FROM products WHERE slug = 'suede-moto-jacket'), 'SMJ-M-BRN', 'M', 'Brown', '#8B4513', 10),
    ((SELECT id FROM products WHERE slug = 'suede-moto-jacket'), 'SMJ-L-BRN', 'L', 'Brown', '#8B4513', 8),
    ((SELECT id FROM products WHERE slug = 'suede-moto-jacket'), 'SMJ-XL-BRN', 'XL', 'Brown', '#8B4513', 5),
    ((SELECT id FROM products WHERE slug = 'denim-jacket'), 'DJ-XS-MED', 'XS', 'Medium Wash', '#5B7F95', 10),
    ((SELECT id FROM products WHERE slug = 'denim-jacket'), 'DJ-S-MED', 'S', 'Medium Wash', '#5B7F95', 16),
    ((SELECT id FROM products WHERE slug = 'denim-jacket'), 'DJ-M-MED', 'M', 'Medium Wash', '#5B7F95', 20),
    ((SELECT id FROM products WHERE slug = 'denim-jacket'), 'DJ-L-MED', 'L', 'Medium Wash', '#5B7F95', 14),
    ((SELECT id FROM products WHERE slug = 'denim-jacket'), 'DJ-XL-MED', 'XL', 'Medium Wash', '#5B7F95', 8),
    ((SELECT id FROM products WHERE slug = 'rain-jacket'), 'RJ-S-NAVY', 'S', 'Navy', '#1E3A5F', 12),
    ((SELECT id FROM products WHERE slug = 'rain-jacket'), 'RJ-M-NAVY', 'M', 'Navy', '#1E3A5F', 18),
    ((SELECT id FROM products WHERE slug = 'rain-jacket'), 'RJ-L-NAVY', 'L', 'Navy', '#1E3A5F', 15),
    ((SELECT id FROM products WHERE slug = 'rain-jacket'), 'RJ-XL-NAVY', 'XL', 'Navy', '#1E3A5F', 10),
    ((SELECT id FROM products WHERE slug = 'wool-blend-coat'), 'WBC-S-CHAR', 'S', 'Charcoal', '#36454F', 6),
    ((SELECT id FROM products WHERE slug = 'wool-blend-coat'), 'WBC-M-CHAR', 'M', 'Charcoal', '#36454F', 10),
    ((SELECT id FROM products WHERE slug = 'wool-blend-coat'), 'WBC-L-CHAR', 'L', 'Charcoal', '#36454F', 8),
    ((SELECT id FROM products WHERE slug = 'wool-blend-coat'), 'WBC-XL-CHAR', 'XL', 'Charcoal', '#36454F', 4),
    ((SELECT id FROM products WHERE slug = 'linen-blazer'), 'LB-XS-NAT', 'XS', 'Natural', '#E8DCC8', 8),
    ((SELECT id FROM products WHERE slug = 'linen-blazer'), 'LB-S-NAT', 'S', 'Natural', '#E8DCC8', 12),
    ((SELECT id FROM products WHERE slug = 'linen-blazer'), 'LB-M-NAT', 'M', 'Natural', '#E8DCC8', 14),
    ((SELECT id FROM products WHERE slug = 'linen-blazer'), 'LB-L-NAT', 'L', 'Natural', '#E8DCC8', 10),
    ((SELECT id FROM products WHERE slug = 'linen-blazer'), 'LB-XL-NAT', 'XL', 'Natural', '#E8DCC8', 6),
    ((SELECT id FROM products WHERE slug = 'knit-cardigan-coat'), 'KCC-XS-CAML', 'XS', 'Camel', '#C19A6B', 6),
    ((SELECT id FROM products WHERE slug = 'knit-cardigan-coat'), 'KCC-S-CAML', 'S', 'Camel', '#C19A6B', 10),
    ((SELECT id FROM products WHERE slug = 'knit-cardigan-coat'), 'KCC-M-CAML', 'M', 'Camel', '#C19A6B', 12),
    ((SELECT id FROM products WHERE slug = 'knit-cardigan-coat'), 'KCC-L-CAML', 'L', 'Camel', '#C19A6B', 8),
    ((SELECT id FROM products WHERE slug = 'knit-cardigan-coat'), 'KCC-XL-CAML', 'XL', 'Camel', '#C19A6B', 4),
    ((SELECT id FROM products WHERE slug = 'quilted-jacket'), 'QJ-S-NAVY', 'S', 'Navy', '#1E3A5F', 12),
    ((SELECT id FROM products WHERE slug = 'quilted-jacket'), 'QJ-M-NAVY', 'M', 'Navy', '#1E3A5F', 16),
    ((SELECT id FROM products WHERE slug = 'quilted-jacket'), 'QJ-L-NAVY', 'L', 'Navy', '#1E3A5F', 14),
    ((SELECT id FROM products WHERE slug = 'quilted-jacket'), 'QJ-XL-NAVY', 'XL', 'Navy', '#1E3A5F', 10);

-- =====================================================
-- Update the page query to use the new variants
-- =====================================================

-- Verify the data was inserted
SELECT 
    p.name as product_name,
    pv.sku,
    pv.size,
    pv.color,
    pv.color_hex,
    pv.price_modifier,
    pv.stock_quantity
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
ORDER BY p.name, pv.size, pv.color
LIMIT 20;

-- ============================================
-- Lyra Fashion - Complete Database Migration
-- Story 1-3: Database Schema & Core API Setup
-- ============================================
-- Run this entire script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pexsipchcidsoqydigbt/sql/new
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  craftsmanship_content JSONB,
  transparency_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- ============================================
-- 2. CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 4. ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  variant JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- 5. INVENTORY TABLE
-- ============================================
CREATE TABLE inventory (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  production_status TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_production_status ON inventory(production_status);

-- ============================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Products: Publicly readable
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);

-- Inventory: Publicly readable
CREATE POLICY "Inventory is publicly readable" ON inventory FOR SELECT USING (true);

-- Customers: Owner-only access
CREATE POLICY "Customers can view own data" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customers can update own data" ON customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Customers can insert own data" ON customers FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders: Owner-only access
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = customer_id);

-- Order Items: Inherit from orders
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL))
);
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL))
);

-- ============================================
-- 8. SEED TEST DATA
-- ============================================

INSERT INTO products (name, slug, description, price, category, images, craftsmanship_content, transparency_data)
VALUES 
  ('Organic Cotton Dress', 'organic-cotton-dress', 'A beautiful handcrafted dress made from 100% organic cotton', 189.00, 'dresses', 
   ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], 
   '{"story": "Handwoven by artisans in Nepal", "materials": ["Organic Cotton"], "techniques": ["Hand-stitching", "Natural Dyes"]}',
   '{"origin": "Nepal", "carbonFootprint": "2.5kg CO2", "certifications": ["GOTS", "Fair Trade"]}'),
  
  ('Linen Summer Blouse', 'linen-summer-blouse', 'Light and breathable linen blouse perfect for summer', 129.00, 'tops',
   ARRAY['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800'],
   '{"story": "Crafted in small batches in Portugal", "materials": ["European Linen"], "techniques": ["Traditional Weaving"]}',
   '{"origin": "Portugal", "carbonFootprint": "1.8kg CO2", "certifications": ["OEKO-TEX"]}'),
  
  ('Handwoven Silk Scarf', 'handwoven-silk-scarf', 'Luxurious silk scarf with traditional patterns', 95.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
   '{"story": "Each scarf takes 3 days to weave by hand", "materials": ["Mulberry Silk"], "techniques": ["Hand Loom Weaving"]}',
   '{"origin": "India", "carbonFootprint": "0.5kg CO2", "certifications": ["Handmade"]}'),

  ('Sustainable Denim Jeans', 'sustainable-denim-jeans', 'Classic fit jeans made from recycled denim', 165.00, 'bottoms',
   ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
   '{"story": "Made from 80% recycled denim in our zero-waste factory", "materials": ["Recycled Cotton Denim"], "techniques": ["Laser Finishing"]}',
   '{"origin": "Italy", "carbonFootprint": "3.2kg CO2", "certifications": ["GRS", "B Corp"]}'),

  ('Merino Wool Cardigan', 'merino-wool-cardigan', 'Cozy cardigan from ethically sourced merino wool', 225.00, 'outerwear',
   ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
   '{"story": "Knitted by skilled artisans using traditional techniques", "materials": ["ZQ Merino Wool"], "techniques": ["Hand Knitting"]}',
   '{"origin": "New Zealand", "carbonFootprint": "4.1kg CO2", "certifications": ["ZQ Merino", "Woolmark"]}');

-- Add inventory for products
INSERT INTO inventory (product_id, quantity, reserved, production_status)
SELECT id, 25, 0, 'ready' FROM products;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Verify by running: SELECT * FROM products;

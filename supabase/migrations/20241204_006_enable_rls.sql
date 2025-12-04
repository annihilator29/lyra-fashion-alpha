-- Migration: Enable Row Level Security (RLS) on all tables
-- Epic 1, Story 1.3 - Database Schema & Core API Setup
-- Security: RLS policies for data access control

-- ============================================
-- Enable RLS on all tables
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Products: Publicly readable
-- ============================================

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  USING (true);

-- Admin-only insert/update/delete (via service role key)
CREATE POLICY "Products admin insert"
  ON products FOR INSERT
  WITH CHECK (false);  -- Only via service role

CREATE POLICY "Products admin update"
  ON products FOR UPDATE
  USING (false);  -- Only via service role

CREATE POLICY "Products admin delete"
  ON products FOR DELETE
  USING (false);  -- Only via service role

-- ============================================
-- Customers: Owner-only access
-- ============================================

CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Customers can insert own data"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Orders: Owner-only access (or guest with NULL customer_id)
-- ============================================

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = customer_id);

-- ============================================
-- Order Items: Inherit order access via join
-- ============================================

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL)
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL)
    )
  );

-- ============================================
-- Inventory: Publicly readable
-- ============================================

CREATE POLICY "Inventory is publicly readable"
  ON inventory FOR SELECT
  USING (true);

-- Admin-only modifications (via service role key)
CREATE POLICY "Inventory admin insert"
  ON inventory FOR INSERT
  WITH CHECK (false);  -- Only via service role

CREATE POLICY "Inventory admin update"
  ON inventory FOR UPDATE
  USING (false);  -- Only via service role

COMMENT ON POLICY "Products are publicly readable" ON products IS 'Allow anonymous product browsing';
COMMENT ON POLICY "Users can view own orders" ON orders IS 'Restrict order access to authenticated owner';

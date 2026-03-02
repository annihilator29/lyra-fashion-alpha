-- Migration: Add admin dashboard indexes and role column
-- Story 7.1a: Admin Dashboard - Foundation
-- Description: Add role column to customers table and create performance indexes for admin queries

-- Add role column to customers table if not exists
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' 
CHECK (role IN ('customer', 'admin', 'super_admin'));

-- Add last_login column for active user tracking
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Create indexes for admin dashboard performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_last_login ON customers(last_login);

-- Update existing customers to have 'customer' role if null
UPDATE customers 
SET role = 'customer' 
WHERE role IS NULL;

-- Create RLS policies for admin access to orders
DROP POLICY IF EXISTS admin_orders_read ON orders;
CREATE POLICY admin_orders_read ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Create RLS policies for admin access to order_items
DROP POLICY IF EXISTS admin_order_items_read ON order_items;
CREATE POLICY admin_order_items_read ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Create RLS policies for admin access to customers
DROP POLICY IF EXISTS admin_customers_read ON customers;
CREATE POLICY admin_customers_read ON customers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM customers AS cp 
            WHERE cp.id = auth.uid() AND cp.role IN ('admin', 'super_admin'))
  );

-- Update is_admin function to check customers table role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin or super_admin role';

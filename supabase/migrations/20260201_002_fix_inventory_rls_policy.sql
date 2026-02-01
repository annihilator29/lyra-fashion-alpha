-- Migration: Fix inventory RLS policy to use correct admin check
-- Description: Update RLS policy to use is_admin() function instead of non-existent profiles table

-- Drop and recreate the admin management policy to use is_admin() function
DROP POLICY IF EXISTS "Only admins can manage inventory" ON inventory;
CREATE POLICY "Only admins can manage inventory" ON inventory
    FOR ALL USING (is_admin());

-- Verify the policy is created correctly
COMMENT ON POLICY "Only admins can manage inventory" ON inventory IS 'Allows only admin users to manage inventory using the is_admin() function';

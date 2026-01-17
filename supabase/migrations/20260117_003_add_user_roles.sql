-- Migration: Add role column to auth.users
-- Description: Add role-based access control for admin functionality

-- Add role column to auth.users table
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb DEFAULT '{}';

-- Note: Supabase stores custom user data in raw_user_meta_data
-- We'll use this field to store role information

-- Example: Update a specific user to admin role
-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_set(
--   COALESCE(raw_user_meta_data, '{}'),
--   '{role}',
--   '"admin"'
-- )
-- WHERE email = 'your-admin-email@example.com';

-- Create a helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (raw_user_meta_data->>'role') = 'admin',
      false
    )
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin role';

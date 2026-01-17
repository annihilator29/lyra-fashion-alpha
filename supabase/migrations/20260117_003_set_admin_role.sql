-- ========================================
-- ADMIN ROLE SETUP - RUN IN SUPABASE SQL EDITOR
-- Email: bibek.mallik29@gmail.com
-- ========================================

-- Step 1: Create admin check function
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

-- Step 2: Set bibek.mallik29@gmail.com as admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'bibek.mallik29@gmail.com';

-- Step 3: Verify the update
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'bibek.mallik29@gmail.com';

-- Expected output:
-- role should show 'admin'

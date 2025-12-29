-- Migration: Update customer creation trigger to handle email verification and preferences
-- Fixes for Story 4.1: User Registration & Authentication
-- Fixes:
--   - Only create customer after email verification (Fix #10)
--   - Preferences are kept as defaults since form doesn't capture them (Fix #8)

-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user AFTER email verification
CREATE OR REPLACE FUNCTION public.handle_verified_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create customer if user is verified (email_confirmed_at is not null)
  -- This prevents "partial account states" and ensures customers only exist for verified users
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.customers (id, email, name, preferences)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'name',
      -- MVP: Keep default preferences - form doesn't capture preferences yet
      '{"style_preferences": [], "email_marketing": false}'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires on UPDATE (when email is confirmed)
-- This is different from INSERT trigger - we wait for verification
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;

CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  -- Only fire when email_confirmed_at changes from NULL to NOT NULL
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_verified_user();

-- Add comment documenting the change
COMMENT ON FUNCTION public.handle_verified_user IS 'Creates a customer profile only after user verifies their email. Prevents partial account states and unverified customer records.';

-- Note on Preferences (Fix #8):
-- MVP Decision: Registration form does not capture user preferences (email marketing consent, style preferences)
-- Default preferences are set in the trigger above
-- For Growth phase: Add preference checkboxes to registration form and pass them via metadata
-- Example future implementation:
--   - Add "email_marketing" checkbox to AuthForm
--   - Add style preference multi-select/dropdown
--   - Pass in signup: { data: { name, email_marketing, style_preferences } }
--   - Update trigger: NEW.raw_user_meta_data->>'email_marketing', etc.

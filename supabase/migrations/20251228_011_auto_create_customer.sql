-- Migration: Auto-create customer on user signup
-- Story 4.1: User Registration & Authentication

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id, email, name, preferences)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    '{"style_preferences": [], "email_marketing": false}'::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
-- Drop if exists to be safe/idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a customer profile when a new user signs up';

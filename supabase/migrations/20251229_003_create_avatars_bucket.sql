-- Migration: Create avatars storage bucket
-- Epic 4, Story 4.2 - Customer Profile & Preferences
-- Bucket: avatars - Store user profile images

-- Create storage bucket for avatars (using ON CONFLICT to handle existing buckets)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Note: RLS policies are managed by Supabase Storage service
-- Public read access is automatically granted for public buckets

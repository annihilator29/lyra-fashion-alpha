-- Migration: Create blog_posts table
-- Epic 5, Story 5.2 - Blog & Content Management System
-- Table: blog_posts - Blog content with SEO, categories, tags

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  categories JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  reading_time INTEGER,  -- Calculated reading time in minutes
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);

-- Create trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Published posts are publicly readable
CREATE POLICY "Published posts are publicly readable"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Authenticated users can view their own posts (any status)
CREATE POLICY "Authors can view own posts"
  ON blog_posts FOR SELECT
  USING (auth.uid() = author_id);

-- Authenticated users can create posts (will be draft by default)
CREATE POLICY "Authenticated users can create posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON blog_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
  ON blog_posts FOR DELETE
  USING (auth.uid() = author_id);

-- Admin-only full access policy (requires admin role check in app layer)
-- Note: This policy gives authenticated users basic access, admin checks happen in app code

COMMENT ON TABLE blog_posts IS 'Blog posts for Lyra Fashion content marketing';
COMMENT ON COLUMN blog_posts.content IS 'Markdown content for blog post body';
COMMENT ON COLUMN blog_posts.categories IS 'JSONB array: Craftsmanship, Styling Tips, Factory Stories, Quality Guide';
COMMENT ON COLUMN blog_posts.tags IS 'JSONB array for flexible tagging';
COMMENT ON COLUMN blog_posts.reading_time IS 'Estimated reading time in minutes (calculated from content)';

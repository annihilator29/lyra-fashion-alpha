-- Migration: Create products table
-- Epic 1, Story 1.3 - Database Schema & Core API Setup
-- Table: products - Core product catalog with craftsmanship and transparency data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',  -- Array of image URLs
  category TEXT NOT NULL,
  craftsmanship_content JSONB,  -- Rich content for craftsmanship section
  transparency_data JSONB,  -- For TransparencyModule pattern
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE products IS 'Core product catalog for Lyra Fashion';
COMMENT ON COLUMN products.craftsmanship_content IS 'JSONB for rich craftsmanship storytelling content';
COMMENT ON COLUMN products.transparency_data IS 'JSONB for ethical/sustainability transparency module';

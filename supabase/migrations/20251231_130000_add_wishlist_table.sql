-- Migration: Create wishlist_items table
-- Epic 4, Story 4.4 - Wishlist & Favorites
-- Table: wishlist_items - Stores user wishlists for authenticated users
-- Guest wishlists stored in localStorage (see Dev Notes)

-- Create wishlist_items table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add UNIQUE constraint to prevent duplicate wishlist items for authenticated users
ALTER TABLE wishlist_items
  ADD CONSTRAINT wishlist_items_user_product_unique
  UNIQUE (user_id, product_id);

-- Create indices for performance
CREATE INDEX idx_wishlist_items_user_product
  ON wishlist_items(user_id, product_id);

CREATE INDEX idx_wishlist_items_created_at
  ON wishlist_items(user_id, created_at DESC);

CREATE INDEX idx_wishlist_items_product
  ON wishlist_items(product_id);

-- Enable Row Level Security
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist"
  ON wishlist_items
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Anonymous can read for migration purposes (guest wishlist items)
CREATE POLICY "Anonymous can read for migration"
  ON wishlist_items
  FOR SELECT
  USING (user_id IS NULL);

-- Add comments for documentation
COMMENT ON TABLE wishlist_items IS 'Stores user wishlist items for authenticated users. Guest wishlists use localStorage.';
COMMENT ON COLUMN wishlist_items.user_id IS 'NULL for guest wishlists (localStorage), references auth.users(id) for authenticated users';
COMMENT ON COLUMN wishlist_items.product_id IS 'References products.id)';
COMMENT ON CONSTRAINT wishlist_items_user_product_unique ON wishlist_items IS 'Prevents duplicate wishlist items for authenticated users';
COMMENT ON POLICY "Users can view own wishlist" ON wishlist_items IS 'Users can only see their own wishlist items or NULL user_id for migration';
COMMENT ON POLICY "Users can insert own wishlist items" ON wishlist_items IS 'Users can only add items to their own wishlist';
COMMENT ON POLICY "Users can delete own wishlist items" ON wishlist_items IS 'Users can only remove items from their own wishlist';
COMMENT ON POLICY "Anonymous can read for migration" ON wishlist_items IS 'Allows reading items with NULL user_id for guest-to-auth migration';

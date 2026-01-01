import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WishlistGrid } from '@/components/account/wishlist-grid';
import { EmptyWishlist } from '@/components/account/empty-wishlist';
import type { Product } from '@/types/database.types';

// ISR: Revalidate every 15 minutes
export const revalidate = 900;

/**
 * Wishlist Page
 * Story 4.4 - Wishlist & Favorites
 *
 * Server component that:
 * 1. Checks authentication and redirects unauthenticated users
 * 2. Fetches user's wishlist items from database
 * 3. Renders WishlistGrid with products or EmptyWishlist if empty
 */
export default async function WishlistPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's wishlist items with product details
  const { data: wishlistItems, error } = await supabase
    .from('wishlist_items')
    .select('*, products(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="mb-4 font-serif text-3xl font-semibold text-foreground">
            Error Loading Wishlist
          </h1>
          <p className="text-base text-muted-foreground">
            We encountered an error loading your wishlist. Please try again later.
          </p>
          <button
            onClick={() => redirect('/account')}
            className="mt-6 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90"
          >
            Back to Account
          </button>
        </div>
      </div>
    );
  }

  // Extract products from wishlist items
  const products: Product[] = wishlistItems
    ? wishlistItems.map((item) => item.products as Product)
    : [];

  // Render wishlist grid or empty state
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">
          My Wishlist
        </h1>

        {products.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <WishlistGrid products={products} />
        )}
      </div>
    </div>
  );
}

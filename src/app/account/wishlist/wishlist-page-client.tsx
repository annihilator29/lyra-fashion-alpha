'use client';

import { useRouter } from 'next/navigation';
import { WishlistGrid } from '@/components/account/wishlist-grid';
import type { Product } from '@/types/database.types';

interface WishlistPageClientProps {
  products: Product[];
}

/**
 * WishlistPageClient Component
 *
 * Client-side wrapper for wishlist page that handles item removal and page refresh.
 */
export function WishlistPageClient({ products }: WishlistPageClientProps) {
  const router = useRouter();

  // Handle item removal and refresh the page
  const handleRemoved = () => {
    router.refresh();
  };

  return <WishlistGrid products={products} onRemoved={handleRemoved} />;
}

/**
 * Wishlist utilities for guest localStorage handling and migration to authenticated user
 * Story 4.4 - Wishlist & Favorites
 */

const GUEST_WISHLIST_KEY = 'lyra_guest_wishlist';

/**
 * Guest wishlist structure stored in localStorage
 */
export interface GuestWishlist {
  sessionId: string;
  items: string[]; // Array of product IDs
  createdAt: string;
}

/**
 * Get guest wishlist from localStorage
 * @returns Guest wishlist or null if not found
 */
export function getGuestWishlist(): GuestWishlist | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const guestWishlist = localStorage.getItem(GUEST_WISHLIST_KEY);

    if (!guestWishlist) {
      return null;
    }

    return JSON.parse(guestWishlist) as GuestWishlist;
  } catch (error) {
    console.error('Failed to read guest wishlist from localStorage:', error);
    return null;
  }
}

/**
 * Add product to guest wishlist
 * @param productId - Product ID to add
 */
export function addToGuestWishlist(productId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const guestWishlist = getGuestWishlist();

    if (guestWishlist?.items.includes(productId)) {
      // Item already in wishlist
      return;
    }

    const newWishlist: GuestWishlist = guestWishlist
      ? {
          ...guestWishlist,
          items: [...guestWishlist.items, productId],
        }
      : {
          sessionId: generateSessionId(),
          items: [productId],
          createdAt: new Date().toISOString(),
        };

    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newWishlist));
  } catch (error) {
    console.error('Failed to add item to guest wishlist:', error);
  }
}

/**
 * Remove product from guest wishlist
 * @param productId - Product ID to remove
 */
export function removeFromGuestWishlist(productId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const guestWishlist = getGuestWishlist();

    if (!guestWishlist) {
      return;
    }

    const newItems = guestWishlist.items.filter(
      (id) => id !== productId
    );

    if (newItems.length === 0) {
      // Remove wishlist if empty
      localStorage.removeItem(GUEST_WISHLIST_KEY);
      return;
    }

    const newWishlist: GuestWishlist = {
      ...guestWishlist,
      items: newItems,
    };

    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newWishlist));
  } catch (error) {
    console.error('Failed to remove item from guest wishlist:', error);
  }
}

/**
 * Check if product is in guest wishlist
 * @param productId - Product ID to check
 * @returns True if product is in wishlist
 */
export function isInGuestWishlist(productId: string): boolean {
  const guestWishlist = getGuestWishlist();
  return guestWishlist?.items.includes(productId) || false;
}

/**
 * Get all product IDs from guest wishlist
 * @returns Array of product IDs
 */
export function getGuestWishlistItems(): string[] {
  const guestWishlist = getGuestWishlist();
  return guestWishlist?.items || [];
}

/**
 * Clear guest wishlist from localStorage
 */
export function clearGuestWishlist(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch (error) {
    console.error('Failed to clear guest wishlist:', error);
  }
}

/**
 * Generate a session ID for guest wishlist
 * @returns Random session ID
 */
function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if user has a guest wishlist
 * @returns True if guest wishlist exists and has items
 */
export function hasGuestWishlist(): boolean {
  const guestWishlist = getGuestWishlist();
  return guestWishlist !== null && guestWishlist.items.length > 0;
}

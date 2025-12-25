import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Returns a singleton Stripe client instance initialized with the publishable key.
 * The instance is cached to avoid multiple initialization calls.
 *
 * @returns A Promise that resolves to the Stripe client or null if initialization fails
 *
 * @example
 * ```typescript
 * import { getStripe } from '@/lib/stripe';
 *
 * const stripe = await getStripe();
 * if (stripe) {
 *   // Use stripe for payment operations
 * }
 * ```
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
    );
  }
  return stripePromise;
};

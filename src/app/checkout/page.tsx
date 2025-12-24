import CheckoutClient from './CheckoutClient';

// Server Component - simple wrapper for client component
export default function CheckoutPage() {
  // The CheckoutClient component handles all cart state and validation
  // Client components can access Zustand stores
  return <CheckoutClient />;
}
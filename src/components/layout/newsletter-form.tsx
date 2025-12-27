'use client';

import { useActionState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    { message: '', success: false }
  );

  return (
    <div>
      <form action={formAction} className="space-y-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address for newsletter subscription
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          aria-label="Email address for newsletter subscription"
          className="w-full px-2 py-1 rounded bg-[#5A5651] text-[#F5F3F0] placeholder:text-[#F5F3F0]/50 border border-[#5A5651] focus:outline-none focus:ring-2 focus:ring-[#C9B89E] focus:border-transparent text-xs"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-label="Subscribe to newsletter"
          className="w-full px-2 py-1 bg-[#C9B89E] text-[#3A3531] font-semibold rounded hover:bg-[#A89C7E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
        >
          {isPending ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {state.message && (
        <p
          className={`text-xs mt-1 ${
            state.success ? 'text-[#7CB342]' : 'text-[#EF5350]'
          }`}
          role="alert"
        >
          {state.message}
        </p>
      )}
    </div>
  );
}

'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// Email validation schema
const emailSchema = z.object({
  email: z.string().email('Invalid email format'),
});

interface NewsletterFormState {
  message: string;
  success: boolean;
}

/**
 * Server action to handle newsletter subscription
 * Validates email format and inserts into Supabase newsletter_subscriptions table
 * Handles duplicate email errors gracefully
 */
export async function subscribeToNewsletter(
  prevState: NewsletterFormState,
  formData: FormData
 ): Promise<NewsletterFormState> {
  const supabase = await createClient();
  const email = formData.get('email');

  // Validate email format
  try {
    const { email: validatedEmail } = emailSchema.parse({ email });

    // Attempt insert directly - rely on database unique constraint for duplicates
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({ email: validatedEmail });

    if (error) {
      // Handle unique constraint violation (Postgres error code 23505)
      if (error.code === '23505') {
        return {
          message: 'Email already subscribed',
          success: false,
        };
      }

      // Handle other database errors
      console.error('Newsletter subscription error:', error);
      return {
        message: 'Subscription failed. Please try again.',
        success: false,
      };
    }

    // Success
    return {
      message: 'Successfully subscribed!',
      success: true,
    };
  } catch (err) {
    console.error('Validation error:', err);

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      return {
        message: err.issues[0]?.message || 'Please enter a valid email address',
        success: false,
      };
    }

    // Handle unexpected errors
    return {
      message: 'Subscription failed. Please try again.',
      success: false,
    };
  }
}

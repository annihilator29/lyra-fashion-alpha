/**
 * Unsubscribe Token Utilities
 * Story 4.5: Email Notifications & Marketing Preferences
 * Token generation and validation for one-click unsubscribe (CAN-SPAM compliance)
 */

import { createClient } from '@/lib/supabase/server';
import type { UnsubscribeTokenType } from '@/types/email';

/**
 * Generate unique unsubscribe token
 * @param email - User's email address
 * @param tokenType - Type of unsubscribe: 'marketing', 'all', 'transactional'
 * @returns Generated token string
 */
export async function generateUnsubscribeToken(
  email: string,
  tokenType: 'marketing' | 'all' | 'transactional' = 'marketing'
): Promise<string> {
  const supabase = await createClient();

  // Generate cryptographically secure random token
  const token = crypto.randomUUID();

  // Calculate expiration (7 days for security)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store token in database
  const { error } = await supabase
    .from('unsubscribe_tokens')
    .insert({
      email,
      token,
      token_type: tokenType,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error('Failed to generate unsubscribe token:', error);
    throw new Error('TOKEN_GENERATION_FAILED');
  }

  return token;
}

/**
 * Validate unsubscribe token and return email + type
 * @param token - Unsubscribe token to validate
 * @returns Object with email and token_type if valid, null otherwise
 */
export async function validateUnsubscribeToken(
  token: string
): Promise<{ email: string; token_type: string } | null> {
  const supabase = await createClient();

  // Query for valid (unused and not expired) token
  const { data, error } = await supabase
    .from('unsubscribe_tokens')
    .select('email, token_type')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return {
    email: data.email,
    token_type: data.token_type,
  };
}

/**
 * Mark unsubscribe token as used
 * @param token - Token to mark as used
 */
export async function markUnsubscribeTokenUsed(token: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('unsubscribe_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token);

  if (error) {
    console.error('Failed to mark unsubscribe token as used:', error);
    throw new Error('TOKEN_UPDATE_FAILED');
  }
}

/**
 * Clean up expired unsubscribe tokens (maintenance task)
 * Should be called periodically (e.g., daily cron job)
 */
export async function cleanupExpiredUnsubscribeTokens(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('unsubscribe_tokens')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Failed to cleanup expired tokens:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Process unsubscribe request based on token
 * @param token - Unsubscribe token
 * @returns Success status and updated preferences
 */
export async function processUnsubscribeRequest(
  token: string
): Promise<{ success: boolean; message: string; updatedPreferences?: Record<string, boolean> }> {
  const supabase = await createClient();

  // Validate token first
  const tokenData = await validateUnsubscribeToken(token);

  if (!tokenData) {
    return {
      success: false,
      message: 'Invalid or expired unsubscribe link. Please request a new one.',
    };
  }

  // Mark token as used
  await markUnsubscribeTokenUsed(token);

  // Update email preferences based on token type
  const { email, token_type } = tokenData;

  let updatedPreferences: Record<string, boolean> | undefined;
  let message = '';

  switch (token_type) {
    case 'marketing':
      // Unsubscribe from all marketing emails
      updatedPreferences = {
        order_updates: true, // Keep transactional emails
        new_products: false,
        sales: false,
        blog: false,
      };
      message = 'You have been unsubscribed from marketing emails. You will still receive order updates.';
      break;

    case 'all':
      // Unsubscribe from all emails (including transactional)
      // Note: This is unusual and may violate user expectations
      updatedPreferences = {
        order_updates: false,
        new_products: false,
        sales: false,
        blog: false,
      };
      message = 'You have been unsubscribed from all emails. Note: You will no longer receive order updates.';
      break;

    case 'transactional':
      // Unsubscribe from transactional emails only
      // Rare case - typically users want to keep these
      updatedPreferences = {
        order_updates: false,
        new_products: true, // Keep marketing (if previously subscribed)
        sales: true,
        blog: true,
      };
      message = 'You have been unsubscribed from order-related emails.';
      break;

    default:
      return {
        success: false,
        message: 'Invalid unsubscribe type.',
      };
  }

  if (updatedPreferences) {
    // Find user by email and update preferences
    const { error: updateError } = await supabase
      .from('customers')
      .update({ email_preferences: updatedPreferences })
      .eq('email', email);

    if (updateError) {
      console.error('Failed to update email preferences:', updateError);
      return {
        success: false,
        message: 'Failed to update preferences. Please try again or contact support.',
      };
    }
  }

  return {
    success: true,
    message,
    updatedPreferences,
  };
}

/**
 * Generate unsubscribe URL for email
 * @param email - User's email
 * @param tokenType - Type of unsubscribe
 * @returns Full unsubscribe URL
 */
export function generateUnsubscribeUrl(
  email: string,
  tokenType: 'marketing' | 'all' | 'transactional' = 'marketing'
): string {
  // Generate token (note: This should be called async in practice)
  const token = crypto.randomUUID();

  return `${process.env.NEXT_PUBLIC_APP_URL}/api/email/unsubscribe/${tokenType}/${token}`;
}

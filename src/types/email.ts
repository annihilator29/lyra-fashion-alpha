/**
 * Email Types
 * Story 4.5 - Email Notifications & Marketing Preferences
 * Type definitions for email preferences system
 */

/**
 * Email marketing preferences
 * Stored in customers.email_preferences JSONB column
 */
export interface EmailPreferences {
  order_updates: boolean
  new_products: boolean
  sales: boolean
  blog: boolean
}

/**
 * Unsubscribe token types
 */
export type UnsubscribeTokenType = 'marketing' | 'all' | 'transactional'

/**
 * Valid unsubscribe token types
 */
export const VALID_UNSUBSCRIBE_TOKEN_TYPES = ['marketing', 'all', 'transactional'] as const;

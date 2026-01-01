/**
 * Email Template Utilities
 * Story 4.5: Email Notifications & Marketing Preferences
 *
 * Provides safe property access and default values for email templates
 */

/**
 * Safely access a nested object property with fallback
 * @param obj - Object to access
 * @param path - Dot-separated path (e.g., 'products.name')
 * @param fallback - Fallback value if property is undefined
 * @returns Property value or fallback
 */
export function safeGet<T>(
  obj: unknown,
  path: string,
  fallback: T
): T {
  try {
    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (
        current !== null &&
        typeof current === 'object' &&
        key in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[key]
      } else {
        return fallback
      }
    }

    return current !== undefined && current !== null
      ? (current as T)
      : fallback
  } catch {
    return fallback
  }
}

/**
 * Get first image from product images array
 * @param images - Images array
 * @param fallback - Fallback image URL
 * @returns First image URL or fallback
 */
export function getFirstImage(
  images: string[] | undefined | null,
  fallback: string = '/images/placeholder.jpg'
): string {
  if (!images || images.length === 0) {
    return fallback
  }
  return images[0] || fallback
}

/**
 * Format price to display string
 * @param priceInCents - Price in cents
 * @returns Formatted price string (e.g., "$19.99")
 */
export function formatPrice(priceInCents: number | undefined | null): string {
  if (priceInCents === undefined || priceInCents === null) {
    return '$0.00'
  }
  return `$${(priceInCents / 100).toFixed(2)}`
}

/**
 * Format date to locale string
 * @param date - Date string or Date object
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | undefined | null,
  locale: string = 'en-US'
): string {
  if (!date) {
    return ''
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Truncate text to max length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return `${text.substring(0, maxLength - 3)}...`
}

/**
 * Safely access array item with fallback
 * @param array - Array to access
 * @param index - Index to get
 * @param fallback - Fallback value
 * @returns Array item or fallback
 */
export function safeGetArrayItem<T>(
  array: T[] | undefined | null,
  index: number,
  fallback: T
): T {
  if (!array || array.length === 0 || index < 0 || index >= array.length) {
    return fallback
  }
  return array[index]
}

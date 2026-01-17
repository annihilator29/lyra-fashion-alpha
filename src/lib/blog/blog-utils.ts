/**
 * Blog Utility Functions
 *
 * Utilities for slug generation, reading time calculation, and other blog-related helpers
 */

/**
 * Generates a URL-friendly slug from a title
 * @param title - The blog post title
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .substring(0, 100); // Limit length to 100 characters
}

/**
 * Calculates estimated reading time for blog content
 * @param content - Markdown content of the blog post
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Formats a date string for blog display
 * @param dateString - ISO date string or Date object
 * @returns Formatted date (e.g., "January 15, 2026")
 */
export function formatBlogDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Alias for formatBlogDate (for consistency with admin usage)
 */
export const formatDate = formatBlogDate;

/**
 * Validates that slug is unique (to be called with Supabase check)
 * @param slug - Generated slug
 * @returns Sanitized slug
 */
export function sanitizeSlug(slug: string): string {
  // Remove any remaining unsafe characters
  return slug.replace(/[^a-z0-9-]/g, '');
}

/**
 * Extracts excerpt from content if not provided
 * @param content - Markdown content
 * @param maxLength - Maximum excerpt length (default: 160 characters)
 * @returns Plain text excerpt
 */
export function generateExcerpt(content: string, maxLength = 160): string {
  // Remove markdown syntax (basic)
  const plainText = content
    .replace(/#{1,6}\s/g, '') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .trim();

  // Take first N characters
  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find last complete word within maxLength
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
}

/**
 * Valid blog post categories as per Story requirements
 */
export const BLOG_CATEGORIES = [
  'Craftsmanship',
  'Styling Tips',
  'Factory Stories',
  'Quality Guide',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/**
 * Validates category selection
 * @param category - Category to validate
 * @returns Boolean indicating if category is valid
 */
export function isValidCategory(category: string): category is BlogCategory {
  return BLOG_CATEGORIES.includes(category as BlogCategory);
}

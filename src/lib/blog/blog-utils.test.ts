/**
 * Unit Tests for Blog Utilities
 *
 * Tests slug generation, reading time calculation, excerpt generation, and validation
 */

import {
  generateSlug,
  calculateReadingTime,
  formatBlogDate,
  sanitizeSlug,
  generateExcerpt,
  isValidCategory,
  BLOG_CATEGORIES,
} from '@/lib/blog/blog-utils';

describe('Blog Utilities', () => {
  describe('generateSlug', () => {
    it('should convert title to lowercase slug with dashes', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Hello @World! #Test')).toBe('hello-world-test');
    });

    it('should replace multiple spaces with single dash', () => {
      expect(generateSlug('Hello    World    Test')).toBe('hello-world-test');
    });

    it('should trim excess whitespace', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });

    it('should limit slug length to 100 characters', () => {
      const longTitle = 'a'.repeat(150);
      const slug = generateSlug(longTitle);
      expect(slug.length).toBeLessThanOrEqual(100);
    });

    it('should handle empty strings', () => {
      expect(generateSlug('')).toBe('');
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time for average content', () => {
      const content = 'word '.repeat(200); // 200 words
      expect(calculateReadingTime(content)).toBe(1); // 200 words = 1 minute
    });

    it('should round up reading time', () => {
      const content = 'word '.repeat(250); // 250 words
      expect(calculateReadingTime(content)).toBe(2); // rounds up from 1.25
    });

    it('should handle short content', () => {
      const content = 'short';
      expect(calculateReadingTime(content)).toBe(1); // minimum 1 minute
    });

    it('should handle empty content', () => {
      expect(calculateReadingTime('')).toBe(1); // rounds up to min 1
    });

    it('should ignore extra whitespace in word count', () => {
      const content = 'word  word    word';
      expect(calculateReadingTime(content)).toBe(1);
    });
  });

  describe('formatBlogDate', () => {
    it('should format ISO date to readable format', () => {
      const date = '2026-01-15T12:00:00Z';
      const formatted = formatBlogDate(date);
      expect(formatted).toBe('January 15, 2026');
    });

    it('should handle different months', () => {
      const date = '2026-12-25T12:00:00Z';
      const formatted = formatBlogDate(date);
      expect(formatted).toBe('December 25, 2026');
    });
  });

  describe('sanitizeSlug', () => {
    it('should remove unsafe characters', () => {
      expect(sanitizeSlug('hello-world-123')).toBe('hello-world-123');
    });

    it('should remove uppercase letters', () => {
      expect(sanitizeSlug('Hello-World')).toBe('ello-orld'); // H and W removed
    });

    it('should remove special characters', () => {
      expect(sanitizeSlug('hello@world#123')).toBe('helloworld123');
    });
  });

  describe('generateExcerpt', () => {
    it('should extract plain text from markdown', () => {
      const content = '## Heading\n\nThis is **bold** and *italic* text.';
      const excerpt = generateExcerpt(content, 50);
      expect(excerpt).toContain('This is bold and italic text');
      expect(excerpt).not.toContain('##');
      expect(excerpt).not.toContain('**');
    });

    it('should remove code blocks', () => {
      const content = 'Text before ```code block``` text after';
      const excerpt = generateExcerpt(content);
      expect(excerpt).not.toContain('```');
    });

    it('should remove links but keep link text', () => {
      const content = 'Check out [this link](https://example.com)';
      const excerpt = generateExcerpt(content);
      expect(excerpt).toContain('this link');
      expect(excerpt).not.toContain('https://');
    });

    it('should truncate at word boundary', () => {
      const content = 'This is a very long sentence that should be truncated';
      const excerpt = generateExcerpt(content, 20);
      expect(excerpt.length).toBeLessThanOrEqual(24); // 20 + '...'
      expect(excerpt).toMatch(/\.\.\./);
    });

    it('should not add ellipsis for short content', () => {
      const content = 'Short text';
      const excerpt = generateExcerpt(content, 50);
      expect(excerpt).toBe('Short text');
      expect(excerpt).not.toMatch(/\.\.\./);
    });
  });

  describe('isValidCategory', () => {
    it('should validate correct categories', () => {
      expect(isValidCategory('Craftsmanship')).toBe(true);
      expect(isValidCategory('Styling Tips')).toBe(true);
      expect(isValidCategory('Factory Stories')).toBe(true);
      expect(isValidCategory('Quality Guide')).toBe(true);
    });

    it('should reject invalid categories', () => {
      expect(isValidCategory('Invalid Category')).toBe(false);
      expect(isValidCategory('craftsmanship')).toBe(false); // case-sensitive
      expect(isValidCategory('')).toBe(false);
    });

    it('should have all expected categories defined', () => {
      expect(BLOG_CATEGORIES).toHaveLength(4);
      expect(BLOG_CATEGORIES).toContain('Craftsmanship');
      expect(BLOG_CATEGORIES).toContain('Styling Tips');
      expect(BLOG_CATEGORIES).toContain('Factory Stories');
      expect(BLOG_CATEGORIES).toContain('Quality Guide');
    });
  });
});

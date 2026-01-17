/**
 * Unit Tests for Supabase Storage Utilities
 *
 * Tests image upload validation and URL parsing
 */

import {
  extractFilePathFromUrl,
  isValidImageFile,
  isValidImageSize,
} from '@/lib/supabase/storage';

describe('Supabase Storage Utilities', () => {
  describe('isValidImageFile', () => {
    it('should accept valid image MIME types', () => {
      const validTypes = [
        new File([], 'test.jpg', { type: 'image/jpeg' }),
        new File([], 'test.jpeg', { type: 'image/jpeg' }),
        new File([], 'test.png', { type: 'image/png' }),
        new File([], 'test.webp', { type: 'image/webp' }),
      ];

      validTypes.forEach((file) => {
        expect(isValidImageFile(file)).toBe(true);
      });
    });

    it('should reject invalid MIME types', () => {
      const invalidTypes = [
        new File([], 'test.gif', { type: 'image/gif' }),
        new File([], 'test.pdf', { type: 'application/pdf' }),
        new File([], 'test.svg', { type: 'image/svg+xml' }),
        new File([], 'test.txt', { type: 'text/plain' }),
      ];

      invalidTypes.forEach((file) => {
        expect(isValidImageFile(file)).toBe(false);
      });
    });
  });

  describe('isValidImageSize', () => {
    it('should accept files under 10MB default limit', () => {
      const smallFile = new File([new ArrayBuffer(5 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }); // 5MB
      expect(isValidImageSize(smallFile)).toBe(true);
    });

    it('should reject files over 10MB default limit', () => {
      const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }); // 11MB
      expect(isValidImageSize(largeFile)).toBe(false);
    });

    it('should respect custom size limit', () => {
      const file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' }); // 3MB
      expect(isValidImageSize(file, 2)).toBe(false); // 2MB limit
      expect(isValidImageSize(file, 5)).toBe(true); // 5MB limit
    });

    it('should handle zero-size files', () => {
      const emptyFile = new File([], 'test.jpg', { type: 'image/jpeg' });
      expect(isValidImageSize(emptyFile)).toBe(true);
    });
  });

  describe('extractFilePathFromUrl', () => {
    it('should extract path from valid Supabase Storage URL', () => {
      const url = 'https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/blog-images/2026/01/image.jpg';
      const path = extractFilePathFromUrl(url);
      expect(path).toBe('2026/01/image.jpg');
    });

    it('should return null for invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'https://example.com/image.jpg',
        'https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/',
      ];

      invalidUrls.forEach((url) => {
        const path = extractFilePathFromUrl(url);
        expect(path).toBeNull();
      });
    });

    it('should handle nested paths', () => {
      const url = 'https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/blog-images/a/b/c/image.jpg';
      const path = extractFilePathFromUrl(url);
      expect(path).toBe('a/b/c/image.jpg');
    });
  });
});

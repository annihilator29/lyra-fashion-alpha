/**
 * Supabase Storage Utilities
 *
 * Handles file uploads for blog images
 */

import { createClient } from '../supabase/client';

const BLOG_IMAGES_BUCKET = 'blog-images';

/**
 * Uploads a blog image to Supabase Storage
 * @param file - File to upload
 * @param path - Optional path within bucket (default: current year/month)
 * @returns Public URL of uploaded image or null on error
 */
export async function uploadBlogImage(
  file: File,
  path?: string
): Promise<string | null> {
  const supabase = createClient();

  // Generate path based on current date if not provided
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const defaultPath = `${year}/${month}`;

  // Extract file extension
  const fileExt = file.name.split('.').pop();
  if (!fileExt) {
    console.error('Invalid file name');
    return null;
  }

  // Generate unique filename
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path || defaultPath}/${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading blog image:', uploadError);
    return null;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Deletes a blog image from Supabase Storage
 * @param filePath - Full path to file in storage
 * @returns Success boolean
 */
export async function deleteBlogImage(filePath: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Error deleting blog image:', error);
    return false;
  }

  return true;
}

/**
 * Extracts file path from Supabase Storage URL
 * @param url - Full public URL from Supabase Storage
 * @returns File path within bucket or null
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf(BLOG_IMAGES_BUCKET);

    if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
      return null;
    }

    return pathParts.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}

/**
 * Validates image file type
 * @param file - File to validate
 * @returns Boolean indicating if file type is valid
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Validates image file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @returns Boolean indicating if file size is valid
 */
export function isValidImageSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

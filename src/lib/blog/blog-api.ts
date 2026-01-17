/**
 * Blog API Functions
 *
 * CRUD operations for blog posts using Supabase
 */

import { createClient } from '@/lib/supabase/server';
import type {
  BlogPost,
  BlogPostInsert,
  BlogPostUpdate,
} from '@/types/database.types';
import { calculateReadingTime, generateSlug } from './blog-utils';

/**
 * Fetches all published blog posts with pagination
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of posts per page
 * @returns Array of published posts and total count
 */
export async function getPublishedPosts(
  page: number = 1,
  pageSize: number = 10
): Promise<{ posts: BlogPost[]; total: number }> {
  const supabase = await createClient();

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data: posts, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching published posts:', error);
    return { posts: [], total: 0 };
  }

  return {
    posts: posts || [],
    total: count || 0,
  };
}

/**
 * Fetches a single blog post by slug
 * @param slug - URL slug of the post
 * @returns Blog post or null if not found
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }

  return post;
}

/**
 * Fetches related posts based on categories
 * @param currentPostId - ID of current post to exclude
 * @param categories - Categories to match
 * @param limit - Number of related posts to return
 * @returns Array of related posts
 */
export async function getRelatedPosts(
  currentPostId: string,
  categories: string[],
  limit: number = 3
): Promise<BlogPost[]> {
  const supabase = await createClient();

  // For simplicity, fetch posts with overlapping categories
  // This could be enhanced with more sophisticated matching
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  // Filter posts that share at least one category
  const relatedPosts = (posts || []).filter((post) => {
    const postCategories = (post.categories as string[]) || [];
    return categories.some((cat) => postCategories.includes(cat));
  });

  // If not enough related posts, fill with recent posts
  if (relatedPosts.length < limit && posts) {
    const additionalPosts = posts
      .filter((p) => !relatedPosts.find((rp) => rp.id === p.id))
      .slice(0, limit - relatedPosts.length);
    return [...relatedPosts, ...additionalPosts];
  }

  return relatedPosts.slice(0, limit);
}

/**
 * Fetches posts by category
 * @param category - Category to filter by
 * @param page - Page number
 * @param pageSize - Posts per page
 * @returns Array of posts in category and total count
 */
export async function getPostsByCategory(
  category: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ posts: BlogPost[]; total: number }> {
  const supabase = await createClient();

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  // Use JSONB contains operation for category filtering
  const { data: posts, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .contains('categories', [category])
    .order('published_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching posts by category:', error);
    return { posts: [], total: 0 };
  }

  return {
    posts: posts || [],
    total: count || 0,
  };
}

/**
 * Creates a new blog post (admin/author only)
 * @param post - Blog post data to insert
 * @returns Created blog post or null on error
 */
export async function createPost(
  post: Omit<BlogPostInsert, 'slug' | 'reading_time'>
): Promise<BlogPost | null> {
  const supabase = await createClient();

  // Generate slug from title
  const slug = generateSlug(post.title);

  // Calculate reading time
  const readingTime = calculateReadingTime(post.content);

  const { data: newPost, error } = await supabase
    .from('blog_posts')
    .insert({
      ...post,
      slug,
      reading_time: readingTime,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  return newPost;
}

/**
 * Updates an existing blog post
 * @param id - Post ID to update
 * @param updates - Fields to update
 * @returns Updated post or null on error
 */
export async function updatePost(
  id: string,
  updates: BlogPostUpdate
): Promise<BlogPost | null> {
  const supabase = await createClient();

  // Recalculate reading time if content changed
  const updatedData: BlogPostUpdate = { ...updates };
  if (updates.content) {
    updatedData.reading_time = calculateReadingTime(updates.content);
  }

  // Regenerate slug if title changed
  if (updates.title) {
    updatedData.slug = generateSlug(updates.title);
  }

  const { data: updatedPost, error } = await supabase
    .from('blog_posts')
    .update(updatedData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }

  return updatedPost;
}

/**
 * Deletes a blog post
 * @param id - Post ID to delete
 * @returns Success boolean
 */
export async function deletePost(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }

  return true;
}

/**
 * Publishes a draft post
 * @param id - Post ID to publish
 * @returns Updated post or null on error
 */
export async function publishPost(id: string): Promise<BlogPost | null> {
  return updatePost(id, {
    status: 'published',
    published_at: new Date().toISOString(),
  });
}

/**
 * Unpublishes a published post
 * @param id - Post ID to unpublish
 * @returns Updated post or null on error
 */
export async function unpublishPost(id: string): Promise<BlogPost | null> {
  return updatePost(id, {
    status: 'draft',
    published_at: null,
  });
}

/**
 * Gets all posts for admin interface (includes drafts)
 * @param page - Page number
 * @param pageSize - Posts per page
 * @param status - Optional status filter
 * @returns Array of posts and total count
 */
export async function getAllPosts(
  page: number = 1,
  pageSize: number = 10,
  status?: 'draft' | 'published'
): Promise<{ posts: BlogPost[]; total: number }> {
  const supabase = await createClient();

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(start, end);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: posts, error, count } = await query;

  if (error) {
    console.error('Error fetching all posts:', error);
    return { posts: [], total: 0 };
  }

  return {
    posts: posts || [],
    total: count || 0,
  };
}

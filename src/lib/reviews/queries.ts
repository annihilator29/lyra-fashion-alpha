/**
 * Review Queries for Admin Operations
 * 
 * Database query functions for admin review moderation.
 * 
 * @module lib/reviews/queries
 */

import { createClient } from '@/lib/supabase/server';
import type { Review } from './types';

export interface ReviewFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  productId?: string;
  customerId?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ReviewWithDetails extends Review {
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
  customer: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface ReviewsResponse {
  reviews: ReviewWithDetails[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReviewStatistics {
  pendingCount: number;
  approvedToday: number;
  totalReviews: number;
  approvalRate: number;
  averageRating: number;
  reviewsThisWeek: number;
  reviewsThisMonth: number;
}

/**
 * Fetch reviews for admin with filters and pagination
 */
export async function getReviewsForAdmin(
  filters: ReviewFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 },
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<ReviewsResponse> {
  const supabase = await createClient();
  
  const { page, pageSize } = pagination;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build the query
  let query = supabase
    .from('product_reviews')
    .select(
      `
      *,
      product:products(id, name, slug, category),
      customer:customers(id, email, name)
    `,
      { count: 'exact' }
    );

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  // Apply search filter (product name or customer email)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(
      `product.name.ilike.${searchTerm},customer.email.ilike.${searchTerm},title.ilike.${searchTerm}`
    );
  }

  // Apply date range filter
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  // Apply product filter
  if (filters.productId) {
    query = query.eq('product_id', filters.productId);
  }

  // Apply customer filter
  if (filters.customerId) {
    query = query.eq('customer_id', filters.customerId);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching reviews:', error);
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reviews: (data || []) as ReviewWithDetails[],
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get review statistics for the admin dashboard
 */
export async function getReviewStatistics(): Promise<ReviewStatistics> {
  const supabase = await createClient();

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  // Get start of week (Sunday)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartIso = weekStart.toISOString();

  // Get start of month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartIso = monthStart.toISOString();

  // Run all count queries in parallel
  const [
    pendingResult,
    approvedTodayResult,
    totalResult,
    approvedResult,
    rejectedResult,
    weekResult,
    monthResult,
  ] = await Promise.all([
    // Pending count
    supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    // Approved today
    supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('updated_at', todayIso),

    // Total reviews
    supabase.from('product_reviews').select('*', { count: 'exact', head: true }),

    // Total approved (for rate calculation)
    supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),

    // Total rejected (for rate calculation)
    supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected'),

    // Reviews this week
    supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStartIso),

    // Reviews this month
    supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStartIso),
  ]);

  if (
    pendingResult.error ||
    approvedTodayResult.error ||
    totalResult.error ||
    approvedResult.error ||
    rejectedResult.error ||
    weekResult.error ||
    monthResult.error
  ) {
    console.error('Error fetching statistics:', {
      pending: pendingResult.error,
      approvedToday: approvedTodayResult.error,
      total: totalResult.error,
    });
    throw new Error('Failed to fetch review statistics');
  }

  const pendingCount = pendingResult.count || 0;
  const approvedToday = approvedTodayResult.count || 0;
  const totalReviews = totalResult.count || 0;
  const approvedTotal = approvedResult.count || 0;
  const rejectedTotal = rejectedResult.error ? 0 : rejectedResult.count || 0;
  const reviewsThisWeek = weekResult.count || 0;
  const reviewsThisMonth = monthResult.count || 0;

  // Calculate approval rate (approved / (approved + rejected))
  const moderatedCount = approvedTotal + rejectedTotal;
  const approvalRate = moderatedCount > 0 ? Math.round((approvedTotal / moderatedCount) * 100) : 0;

  return {
    pendingCount,
    approvedToday,
    totalReviews,
    approvalRate,
    averageRating: 0, // Will be calculated separately if needed
    reviewsThisWeek,
    reviewsThisMonth,
  };
}

/**
 * Get a single review by ID with full details
 */
export async function getReviewById(reviewId: string): Promise<ReviewWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('product_reviews')
    .select(
      `
      *,
      product:products(id, name, slug, category),
      customer:customers(id, email, name)
    `
    )
    .eq('id', reviewId)
    .single();

  if (error) {
    console.error('Error fetching review:', error);
    return null;
  }

  return data as ReviewWithDetails;
}

/**
 * Update product review aggregates after approval/rejection
 */
export async function updateProductAggregates(productId: string): Promise<void> {
  const supabase = await createClient();

  // Get all approved reviews for this product
  const { data: reviews, error } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching reviews for aggregate update:', error);
    throw new Error('Failed to update product aggregates');
  }

  const approvedCount = reviews?.length || 0;
  const averageRating =
    approvedCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / approvedCount
      : 0;

  // Update product with new aggregates
  const { error: updateError } = await supabase
    .from('products')
    .update({
      review_count: approvedCount,
      avg_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (updateError) {
    console.error('Error updating product aggregates:', updateError);
    throw new Error('Failed to update product aggregates');
  }
}

/**
 * Export reviews to CSV format
 */
export async function exportReviewsToCSV(
  filters: ReviewFilters = {}
): Promise<string> {
  const supabase = await createClient();

  let query = supabase
    .from('product_reviews')
    .select(
      `
      *,
      product:products(name),
      customer:customers(email, name)
    `
    );

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error exporting reviews:', error);
    throw new Error('Failed to export reviews');
  }

  // CSV header
  const headers = [
    'ID',
    'Product',
    'Customer Email',
    'Customer Name',
    'Rating',
    'Title',
    'Content',
    'Status',
    'Verified',
    'Helpful Count',
    'Fit Feedback',
    'Created At',
    'Updated At',
  ].join(',');

  // CSV rows
  const rows = (data || []).map((review) => {
    const productName = (review.product as { name?: string })?.name || '';
    const customerEmail = (review.customer as { email?: string })?.email || '';
    const customerName = (review.customer as { name?: string })?.name || '';

    return [
      review.id,
      `"${productName.replace(/"/g, '""')}"`,
      customerEmail,
      `"${customerName.replace(/"/g, '""')}"`,
      review.rating,
      `"${(review.title || '').replace(/"/g, '""')}"`,
      `"${(review.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      review.status,
      review.verified,
      review.helpful_count,
      review.fit_feedback,
      review.created_at,
      review.updated_at || review.created_at,
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

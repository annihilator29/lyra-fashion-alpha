'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { createClient } from '@/lib/supabase/client';
import { Review, ReviewSummary, ReviewFilters } from '@/lib/reviews/types';

const PAGE_SIZE = 10;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

interface ReviewPage {
  reviews: Review[];
  hasMore: boolean;
  nextCursor: string | null;
}

interface UseReviewsReturn {
  reviews: Review[];
  summary: ReviewSummary | null;
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  markHelpful: (reviewId: string) => Promise<void>;
  filters: ReviewFilters;
  setFilters: (filters: ReviewFilters) => void;
}

interface FetchReviewsParams {
  productId: string;
  cursor: string | null;
  filters: ReviewFilters;
}

async function fetchReviewsPage(params: FetchReviewsParams): Promise<ReviewPage> {
  const { productId, cursor, filters } = params;
  const supabase = createClient();

  let query = supabase
    .from('product_reviews')
    .select(`
      *,
      customer:customers(first_name, last_name)
    `)
    .eq('product_id', productId)
    .eq('status', 'approved');

  if (filters.verifiedOnly) {
    query = query.eq('verified', true);
  }

  // Apply sorting
  switch (filters.sort) {
    case 'highest':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest':
      query = query.order('rating', { ascending: true });
      break;
    case 'verified':
      query = query.order('verified', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Cursor-based pagination: use created_at for cursor
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: reviewData, error: reviewError } = await query.limit(PAGE_SIZE + 1);

  if (reviewError) throw new Error(`Failed to fetch reviews: ${reviewError.message}`);

  const reviews = reviewData || [];
  const hasMore = reviews.length > PAGE_SIZE;
  const trimmedReviews = hasMore ? reviews.slice(0, PAGE_SIZE) : reviews;
  const nextCursor = hasMore && trimmedReviews.length > 0
    ? trimmedReviews[trimmedReviews.length - 1].created_at
    : null;

  return {
    reviews: trimmedReviews,
    hasMore,
    nextCursor,
  };
}

async function fetchReviewSummary(productId: string): Promise<ReviewSummary> {
  const supabase = createClient();

  const { data: summaryData, error: summaryError } = await supabase
    .rpc('get_review_summary', { p_product_id: productId });

  if (summaryError) {
    // Fallback: calculate summary manually
    const { data: allReviews, error: allError } = await supabase
      .from('product_reviews')
      .select('rating, verified')
      .eq('product_id', productId)
      .eq('status', 'approved');

    if (allError) throw new Error(`Failed to fetch review summary: ${allError.message}`);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    let verifiedCount = 0;

    allReviews?.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
      if (review.verified) verifiedCount++;
    });

    return {
      average_rating: allReviews?.length ? totalRating / allReviews.length : 0,
      total_reviews: allReviews?.length || 0,
      rating_distribution: distribution,
      verified_count: verifiedCount,
    };
  }

  return summaryData;
}

function getCacheKey(productId: string, cursor: string | null, filters: ReviewFilters): string {
  return `reviews:${productId}:${cursor || 'first'}:${filters.sort}:${filters.verifiedOnly}`;
}

function getSummaryCacheKey(productId: string): string {
  return `review-summary:${productId}`;
}

export function useReviews(productId: string): UseReviewsReturn {
  const [filters, setFiltersState] = useState<ReviewFilters>({
    sort: 'newest',
    verifiedOnly: false,
  });
  const [pages, setPages] = useState<ReviewPage[]>([]);

  // Fetch first page
  const firstPageKey = getCacheKey(productId, null, filters);
  const {
    data: firstPageData,
    error: firstPageError,
    isLoading: firstPageLoading,
    mutate: mutateFirstPage,
  } = useSWR(
    productId ? firstPageKey : null,
    () => fetchReviewsPage({ productId, cursor: null, filters }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      refreshInterval: CACHE_DURATION,
      keepPreviousData: true,
    }
  );

  // Fetch summary with caching
  const summaryKey = getSummaryCacheKey(productId);
  const {
    data: summaryData,
    error: summaryError,
    isLoading: summaryLoading,
  } = useSWR(
    productId ? summaryKey : null,
    () => fetchReviewSummary(productId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: CACHE_DURATION,
      refreshInterval: CACHE_DURATION,
    }
  );

  // Load additional pages
  const loadMore = useCallback(() => {
    if (!firstPageData || pages.length >= 5) return; // Limit to 5 pages (50 reviews)

    const lastPage = pages.length > 0 ? pages[pages.length - 1] : firstPageData;
    if (!lastPage.hasMore || !lastPage.nextCursor) return;

    const nextPageKey = getCacheKey(productId, lastPage.nextCursor, filters);

    mutate(nextPageKey, fetchReviewsPage({
      productId,
      cursor: lastPage.nextCursor,
      filters,
    }), {
      optimisticData: { reviews: [], hasMore: false, nextCursor: null },
    }).then((newPage) => {
      if (newPage) {
        setPages((prev) => [...prev, newPage]);
      }
    });
  }, [productId, filters, firstPageData, pages]);

  // Reset pagination when filters change
  const setFilters = useCallback((newFilters: ReviewFilters) => {
    setFiltersState(newFilters);
    setPages([]);
  }, []);

  // Mark review as helpful with optimistic update
  const markHelpful = useCallback(async (reviewId: string) => {
    const supabase = createClient();

    try {
      const { error } = await supabase.rpc('increment_helpful_count', {
        p_review_id: reviewId,
      });

      if (error) throw error;

      // Revalidate cache to get updated data
      await mutateFirstPage();
    } catch (err) {
      console.error('Failed to mark review as helpful:', err);
      throw err;
    }
  }, [mutateFirstPage]);

  // Combine all reviews
  const allReviews = [
    ...(firstPageData?.reviews || []),
    ...pages.flatMap((page) => page.reviews),
  ];

  // Determine if more pages available
  const lastPage = pages.length > 0 ? pages[pages.length - 1] : firstPageData;
  const hasMore = lastPage?.hasMore ?? false;

  // Combined loading and error states
  const loading = firstPageLoading || summaryLoading;
  const error = firstPageError || summaryError;

  return {
    reviews: allReviews,
    summary: summaryData || null,
    loading,
    error: error || null,
    hasMore,
    loadMore,
    markHelpful,
    filters,
    setFilters,
  };
}

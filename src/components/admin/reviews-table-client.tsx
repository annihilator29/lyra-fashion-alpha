/**
 * Reviews Table Client Wrapper
 * 
 * Client-side wrapper that handles URL updates for pagination and sorting.
 * 
 * @module components/admin/reviews-table-client
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ReviewsTable } from './reviews-table';
import type { ReviewWithDetails } from '@/lib/reviews/queries';

type SortField = 'created_at' | 'rating' | 'product' | 'customer' | 'status';

interface ReviewsTableClientProps {
  reviews: ReviewWithDetails[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function ReviewsTableClient({
  reviews,
  totalCount,
  page,
  pageSize,
  totalPages,
  sortBy,
  sortOrder,
}: ReviewsTableClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/admin/reviews?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage.toString() });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateUrl({ pageSize: newPageSize.toString(), page: '1' });
  };

  const handleSortChange = (field: SortField) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    updateUrl({ sortBy: field, sortOrder: newOrder });
  };

  return (
    <ReviewsTable
      reviews={reviews}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSortChange={handleSortChange}
    />
  );
}

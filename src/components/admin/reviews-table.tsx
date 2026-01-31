/**
 * Reviews Table Component
 * 
 * Displays reviews with sorting, row selection, and pagination.
 * Responsive design with mobile-friendly layout.
 * 
 * @module components/admin/reviews-table
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import { ReviewModerationActions, BulkReviewActions } from './review-moderation-actions';
import type { ReviewWithDetails } from '@/lib/reviews/queries';

type SortField = 'created_at' | 'rating' | 'product' | 'customer' | 'status';
type SortOrder = 'asc' | 'desc';

interface ReviewsTableProps {
  reviews: ReviewWithDetails[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (field: SortField) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get status badge variant
 */
function getStatusBadgeVariant(
  status: 'pending' | 'approved' | 'rejected'
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Star rating display component
 */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating}</span>
    </div>
  );
}

/**
 * Sort header component with indicator
 */
function SortHeader({
  field,
  label,
  currentSort,
  currentOrder,
  onSort,
}: {
  field: SortField;
  label: string;
  currentSort: string;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
}) {
  const isActive = currentSort === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      {isActive ? (
        currentOrder === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

export function ReviewsTable({
  reviews,
  totalCount,
  page,
  pageSize,
  totalPages,
  sortBy,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onSelectionChange,
}: ReviewsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = reviews.map((r) => r.id);
      setSelectedIds(allIds);
      onSelectionChange?.(allIds);
    } else {
      setSelectedIds([]);
      onSelectionChange?.([]);
    }
  };

  // Handle select single row
  const handleSelectRow = (reviewId: string, checked: boolean) => {
    if (checked) {
      const newSelected = [...selectedIds, reviewId];
      setSelectedIds(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      const newSelected = selectedIds.filter((id) => id !== reviewId);
      setSelectedIds(newSelected);
      onSelectionChange?.(newSelected);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds([]);
    onSelectionChange?.([]);
  };

  // Check if all visible rows are selected
  const allSelected = reviews.length > 0 && reviews.every((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      <BulkReviewActions
        selectedReviewIds={selectedIds}
        onActionComplete={clearSelection}
        clearSelection={clearSelection}
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all reviews"
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  field="product"
                  label="Product"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSortChange}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  field="customer"
                  label="Customer"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSortChange}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  field="rating"
                  label="Rating"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSortChange}
                />
              </TableHead>
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead className="hidden lg:table-cell">Content</TableHead>
              <TableHead>
                <SortHeader
                  field="status"
                  label="Status"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSortChange}
                />
              </TableHead>
              <TableHead>
                <SortHeader
                  field="created_at"
                  label="Date"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={onSortChange}
                />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No reviews found.
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow
                  key={review.id}
                  data-state={selectedIds.includes(review.id) ? 'selected' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(review.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(review.id, checked as boolean)
                      }
                      aria-label={`Select review ${review.id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/products/${review.product.category}/${review.product.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 hover:underline"
                    >
                      <span className="font-medium">{review.product.name}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {review.customer.name || 'Anonymous User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {review.customer.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StarRating rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <span title={review.title}>{review.title}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[300px]">
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {review.content}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(review.status)}>
                      {review.status}
                    </Badge>
                    {review.verified && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        Verified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(review.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ReviewModerationActions
                      reviewId={review.id}
                      currentStatus={review.status}
                      onActionComplete={clearSelection}
                      variant="compact"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, totalCount)} of {totalCount} reviews
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-4 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

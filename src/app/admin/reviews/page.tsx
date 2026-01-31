/**
 * Admin Review Moderation Page
 * 
 * Server component that loads review data and renders the moderation dashboard.
 * Features statistics cards, search/filter, reviews table, and export functionality.
 * 
 * @module app/admin/reviews/page
 */

import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { getReviewsForAdmin, getReviewStatistics } from '@/lib/reviews/queries';
import { ReviewsTableClient } from '@/components/admin/reviews-table-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportReviewsButton } from '@/components/admin/export-reviews-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Search,
  ArrowLeft,
} from 'lucide-react';

// Revalidate every 30 seconds to keep data fresh
export const revalidate = 30;

interface AdminReviewsPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'all';
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
}

/**
 * Statistics card component
 */
function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
  };

  const iconStyles = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconStyles[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center text-xs mt-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Search and filter form component (server-side)
 */
function SearchAndFilter({
  currentStatus,
  currentSearch,
}: {
  currentStatus: string;
  currentSearch: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form className="flex-1 flex gap-2" action="/admin/reviews">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search by product name, customer email..."
            defaultValue={currentSearch}
            className="pl-8"
          />
        </div>
        <Select name="status" defaultValue={currentStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <ExportReviewsButton status={currentStatus} search={currentSearch} />
    </div>
  );
}

/**
 * Reviews table wrapper with loading state
 */
async function ReviewsTableWrapper({
  page,
  pageSize,
  status,
  search,
  sortBy,
  sortOrder,
}: {
  page: number;
  pageSize: number;
  status: 'pending' | 'approved' | 'rejected' | 'all';
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  const filters = {
    status: status === 'all' ? undefined : status,
    search: search || undefined,
  };

  const pagination = { page, pageSize };

  const { reviews, totalCount, totalPages } = await getReviewsForAdmin(
    filters,
    pagination,
    sortBy,
    sortOrder
  );

  return (
    <ReviewsTableClient
      reviews={reviews}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      sortBy={sortBy}
      sortOrder={sortOrder}
    />
  );
}

/**
 * Loading skeleton for statistics
 */
function StatisticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Main admin reviews page
 */
export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin/reviews');
  }

  // Check admin role
  const admin = await isAdmin();
  if (!admin) {
    redirect('/account/dashboard');
  }

  // Parse search params
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const pageSize = Math.min(100, Math.max(10, parseInt(params.pageSize || '20', 10)));
  const status = (params.status || 'all') as 'pending' | 'approved' | 'rejected' | 'all';
  const search = params.search || '';
  const sortBy = params.sortBy || 'created_at';
  const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc';

  // Fetch statistics
  const stats = await getReviewStatistics();

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Admin
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Moderation</h1>
          <p className="text-muted-foreground">
            Manage and moderate customer product reviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Clock className="mr-1 h-3 w-3" />
            {stats.pendingCount} pending
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <Suspense fallback={<StatisticsSkeleton />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Reviews"
            value={stats.pendingCount}
            icon={Clock}
            description="Awaiting moderation"
            variant={stats.pendingCount > 10 ? 'warning' : 'default'}
          />
          <StatCard
            title="Approved Today"
            value={stats.approvedToday}
            icon={CheckCircle}
            description="Reviews approved today"
            variant="success"
          />
          <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            icon={MessageSquare}
            description={`${stats.reviewsThisWeek} this week`}
          />
          <StatCard
            title="Approval Rate"
            value={`${stats.approvalRate}%`}
            icon={TrendingUp}
            description="Of moderated reviews"
            variant={stats.approvalRate > 80 ? 'success' : 'default'}
          />
        </div>
      </Suspense>

      {/* Search and Filter */}
      <SearchAndFilter currentStatus={status} currentSearch={search} />

      {/* Reviews Table */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <ReviewsTableWrapper
          page={page}
          pageSize={pageSize}
          status={status}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Suspense>
    </div>
  );
}

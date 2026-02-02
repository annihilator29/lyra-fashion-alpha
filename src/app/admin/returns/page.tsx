/**
 * Admin Returns Dashboard Page
 * Story 6.4: Returns & Refunds Processing (Task 7)
 * 
 * Admin interface for managing return requests
 * - Protected with admin role check
 * - List all returns with status, customer, date
 * - Filter by status (requested, approved, received, etc.)
 * - Search by RMA number or order ID
 * - Click to view return details and process
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Package, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { RETURN_STATUS_CONFIG, type ReturnStatus } from '@/types/returns';

interface AdminReturnsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminReturnsPage({ searchParams }: AdminReturnsPageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const params = await searchParams;
  const statusFilter = params.status || 'all';
  const searchQuery = params.search || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 20;

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('returns')
    .select('*, order:orders(order_number, customer_email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Apply status filter
  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  // Apply search filter (RMA number or order ID)
  if (searchQuery) {
    query = query.or(`rma_number.ilike.%${searchQuery}%,order_id.eq.${searchQuery}`);
  }

  const { data: returns, error, count } = await query;

  if (error) {
    console.error('Error fetching returns:', error);
  }

  // Get summary counts
  const { data: statusCounts } = await supabase
    .from('returns')
    .select('status', { count: 'exact' })
    .in('status', ['requested', 'received']);

  const pendingCount = statusCounts?.filter(r => r.status === 'requested').length || 0;
  const inspectionCount = statusCounts?.filter(r => r.status === 'received').length || 0;

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Returns Management</h1>
              <p className="text-muted-foreground">
                {count || 0} total returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-800">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-800">Awaiting Inspection</p>
              <p className="text-2xl font-bold text-blue-900">{inspectionCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-green-800">Ready to Process</p>
              <p className="text-2xl font-bold text-green-900">View List</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <form className="flex-1 flex gap-4" action="/admin/returns">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              type="search"
              placeholder="Search by RMA # or order ID..."
              defaultValue={searchQuery}
              className="pl-10"
            />
          </div>
          
          <select
            name="status"
            defaultValue={statusFilter}
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="shipped">Shipped</option>
            <option value="received">Received</option>
            <option value="inspected">Inspected</option>
            <option value="refunded">Refunded</option>
            <option value="rejected">Rejected</option>
          </select>

          <Button type="submit">Filter</Button>
        </form>
      </div>

      {/* Returns Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RMA #</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Refund Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns && returns.length > 0 ? (
              returns.map((ret) => (
                <TableRow key={ret.id}>
                  <TableCell className="font-mono font-medium">
                    {ret.rma_number}
                  </TableCell>
                  <TableCell>
                    {ret.order?.order_number || ret.order_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={RETURN_STATUS_CONFIG[ret.status as ReturnStatus]?.color}
                    >
                      {RETURN_STATUS_CONFIG[ret.status as ReturnStatus]?.label || ret.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {ret.reason.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${ret.refund_amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(ret.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/returns/${ret.id}`}>
                      <Button variant="ghost" size="sm">
                        Process
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No returns found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/returns?status=${statusFilter}&search=${searchQuery}&page=${page - 1}`}
            >
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          )}
          <span className="py-2 px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/returns?status=${statusFilter}&search=${searchQuery}&page=${page + 1}`}
            >
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

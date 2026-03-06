/**
 * Admin Customers List Page
 * Story 7.4a: Customer Lookup & Profile
 * AC1: Customer Search & Lookup
 * 
 * Features:
 * - Customer search by email, name, phone, order number
 * - Filter by segment (VIP, Regular, New)
 * - Filter by has orders
 * - Filter by date joined
 * - Results table with TanStack Table
 * - Pagination (25 per page)
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';
import { CustomersTable } from '@/components/admin/customers/customers-table';
import { searchCustomers, type CustomerFilters } from '@/app/admin/customers/actions';

interface AdminCustomersPageProps {
  searchParams: Promise<{
    search?: string;
    segment?: 'VIP' | 'Regular' | 'New' | 'all';
    hasOrders?: string;
    dateJoinedFrom?: string;
    dateJoinedTo?: string;
    page?: string;
  }>;
}

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = 25;

  // Build filters from search params
  const filters: CustomerFilters = {
    segment: params.segment as CustomerFilters['segment'],
    hasOrders: params.hasOrders ? params.hasOrders === 'true' : undefined,
    dateJoinedFrom: params.dateJoinedFrom,
    dateJoinedTo: params.dateJoinedTo,
  };

  // Fetch customers using server action
  const { customers, total, hasMore, error } = await searchCustomers(
    params.search || '',
    filters,
    { page, limit }
  );

  if (error) {
    console.error('Error fetching customers:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Customer Management</h1>
              <p className="text-muted-foreground">
                {total || 0} total customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <CustomerFilters currentParams={params} />
      </div>

      {/* Customers Table with TanStack Table */}
      <CustomersTable initialCustomers={customers} totalCount={total} />

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        {hasMore ? (
          <p>
            Showing {customers.length} of {total} customers. Use pagination to view more.
          </p>
        ) : (
          <p>Showing all {customers.length} customers.</p>
        )}
      </div>
    </div>
  );
}

/**
 * Customer Filters Component
 */
function CustomerFilters({ currentParams }: { currentParams: Record<string, any> }) {
  return (
    <form className="flex flex-wrap gap-4">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          name="search"
          placeholder="Search by email, name, phone, or order number..."
          defaultValue={currentParams.search || ''}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        />
      </div>

      {/* Segment Filter */}
      <div className="w-[150px]">
        <select
          name="segment"
          defaultValue={currentParams.segment || 'all'}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Segments</option>
          <option value="VIP">VIP</option>
          <option value="Regular">Regular</option>
          <option value="New">New</option>
        </select>
      </div>

      {/* Has Orders Filter */}
      <div className="w-[150px]">
        <select
          name="hasOrders"
          defaultValue={currentParams.hasOrders || ''}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="">All Customers</option>
          <option value="true">Has Orders</option>
          <option value="false">No Orders</option>
        </select>
      </div>

      {/* Date From */}
      <div className="w-[150px]">
        <input
          type="date"
          name="dateJoinedFrom"
          defaultValue={currentParams.dateJoinedFrom || ''}
          placeholder="From date"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        />
      </div>

      {/* Date To */}
      <div className="w-[150px]">
        <input
          type="date"
          name="dateJoinedTo"
          defaultValue={currentParams.dateJoinedTo || ''}
          placeholder="To date"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" size="sm">
        Apply Filters
      </Button>

      {/* Clear Filters */}
      <Link href="/admin/customers">
        <Button type="button" variant="ghost" size="sm">
          Clear
        </Button>
      </Link>
    </form>
  );
}

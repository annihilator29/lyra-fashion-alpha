/**
 * Admin Orders List Page
 * Story 7.3: Order Management & Fulfillment Tools
 * AC1: Order Listing View, AC6: Bulk Order Operations, AC7: Order Search & Filters
 * 
 * Enhanced admin interface for order management:
 * - TanStack Table with sorting, filtering, pagination
 * - Advanced search and filter capabilities
 * - Bulk operations support
 * - Real-time order updates (Story 7.1c)
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft, Download } from 'lucide-react';
import { OrdersTable } from '@/components/admin/orders/orders-table';
import { OrderFilters } from '@/components/admin/orders/order-filters';
import { getOrders } from '@/app/admin/orders/actions';
import type { OrderFilters as OrderFiltersType } from '@/app/admin/orders/actions';
import type { Order } from '@/types/database.types';

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    paymentStatus?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = 25;

  // Build filters from search params
  const filters: OrderFiltersType = {
    status: params.status as OrderFiltersType['status'],
    search: params.search,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    paymentStatus: params.paymentStatus as OrderFiltersType['paymentStatus'],
  };

  // Fetch orders using server action
  const { orders, total, hasMore, error } = await getOrders(filters, {
    page,
    limit,
  });

  if (error) {
    console.error('Error fetching orders:', error);
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Order Management</h1>
              <p className="text-muted-foreground">
                {total || 0} total orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <OrderFilters />
      </div>

      {/* Orders Table with TanStack Table */}
      <OrdersTable initialOrders={orders as Order[]} totalCount={total} />

      {/* Info Footer */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        {hasMore ? (
          <p>
            Showing {orders.length} of {total} orders. Use pagination to view more.
          </p>
        ) : (
          <p>Showing all {orders.length} orders.</p>
        )}
      </div>
    </div>
  );
}

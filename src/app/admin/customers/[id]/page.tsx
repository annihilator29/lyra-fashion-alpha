/**
 * Admin Customer Detail Page
 * Story 7.4a: Customer Lookup & Profile
 * AC2: Customer Profile View, AC3: Customer Order History, AC4: Customer Addresses & Preferences
 * 
 * Features:
 * - Customer header with name, email, account age, segment badge
 * - Lifetime value card with order stats
 * - Tab navigation: Overview, Orders
 * - Overview tab: customer info, addresses, preferences
 * - Orders tab: order history with filters
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdmin } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';
import { getCustomerById, getCustomerOrderHistory } from '@/app/admin/customers/actions';
import { getCustomerActivityTimeline } from '@/app/admin/customers/activity-actions';
import { CustomerHeader } from '@/components/admin/customers/customer-header';
import { CustomerStatsCard } from '@/components/admin/customers/customer-stats-card';
import { CustomerAddresses } from '@/components/admin/customers/customer-addresses';
import { CustomerPreferences } from '@/components/admin/customers/customer-preferences';
import { CustomerOrders } from '@/components/admin/customers/customer-orders';
import { ActivityTimeline } from '@/components/admin/customers/activity-timeline';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tab?: string;
    orderStatus?: string;
    orderDateFrom?: string;
    orderDateTo?: string;
    orderPage?: string;
    activityType?: string;
  }>;
}

export default async function CustomerDetailPage({ params, searchParams }: CustomerDetailPageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const { id: customerId } = await params;
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || 'overview';

  // Fetch customer data
  const { customer, error } = await getCustomerById(customerId);

  if (error || !customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Customer Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The customer you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/admin/customers">
            <Button>Back to Customers</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch order history if on orders tab
  let orderHistory: { orders: import('@/app/admin/customers/actions').OrderHistoryResult[]; total: number; hasMore: boolean } = { orders: [], total: 0, hasMore: false };
  if (currentTab === 'orders') {
    const orderPage = parseInt(resolvedSearchParams.orderPage || '1', 10);
    orderHistory = await getCustomerOrderHistory(customerId, {
      status: resolvedSearchParams.orderStatus as string | undefined,
      dateFrom: resolvedSearchParams.orderDateFrom,
      dateTo: resolvedSearchParams.orderDateTo,
    }, {
      page: orderPage,
      limit: 25,
    });
  }

  // Fetch activity timeline if on activity tab
  let activityData: { activities: import('@/types/activity').ActivityItem[]; total: number; hasMore: boolean } = { activities: [], total: 0, hasMore: false };
  if (currentTab === 'activity') {
    activityData = await getCustomerActivityTimeline(customerId, { limit: 50, offset: 0 });
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
      </div>

      {/* Customer Header */}
      <CustomerHeader customer={customer} />

      {/* Customer Stats */}
      <CustomerStatsCard customer={customer} />

      {/* Quick Actions */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${customer.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Email Customer
            </a>
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Full Name" value={customer.name || 'N/A'} />
                <InfoRow label="Email" value={customer.email} />
                <InfoRow label="Phone" value={customer.phone_number || 'N/A'} />
                <InfoRow 
                  label="Account Created" 
                  value={new Date(customer.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })} 
                />
                <InfoRow label="Role" value={customer.role || 'customer'} />
              </CardContent>
            </Card>
          </div>

          {/* Addresses */}
          <CustomerAddresses addresses={customer.addresses} />

          {/* Preferences */}
          <CustomerPreferences customer={customer} />
        </div>
      )}

      {currentTab === 'orders' && (
        <CustomerOrders 
          initialOrders={orderHistory.orders} 
          totalCount={orderHistory.total}
          customerId={customerId}
        />
      )}

      {currentTab === 'activity' && (
        <ActivityTimeline
          customerId={customerId}
          initialActivities={activityData.activities}
          initialTotal={activityData.total}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || 'N/A'}</span>
    </div>
  );
}

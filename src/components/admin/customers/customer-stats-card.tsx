/**
 * Customer Stats Card Component
 * Story 7.4a: Customer Lookup & Profile
 * AC2: Customer Profile View
 * 
 * Displays lifetime value and order statistics
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, DollarSign, Calendar } from 'lucide-react';

interface CustomerStatsCardProps {
  customer: {
    lifetime_value: number;
    order_count: number;
    last_order_date: string | null;
  };
}

export function CustomerStatsCard({ customer }: CustomerStatsCardProps) {
  const lastOrderDate = customer.last_order_date 
    ? new Date(customer.last_order_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No orders yet';

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lifetime Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(customer.lifetime_value / 100).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total revenue from customer
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{customer.order_count}</div>
          <p className="text-xs text-muted-foreground">
            Orders placed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Order</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lastOrderDate}</div>
          <p className="text-xs text-muted-foreground">
            Most recent purchase
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

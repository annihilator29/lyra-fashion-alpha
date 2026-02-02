/**
 * Guest Return Page
 * Story 6.4: Returns & Refunds Processing (Task 8)
 * 
 * Allows guest customers (without accounts) to initiate returns
 * - Verify order ownership via order number + email
 * - Initiate return for guest orders
 * - Track return status
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, AlertCircle } from 'lucide-react';
import { GuestReturnForm } from '@/components/returns/guest-return-form';
import { ReturnStatusTimeline } from '@/components/returns/return-status-timeline';
import { ORDER_STATUS_CONFIG } from '@/types/order';

interface GuestReturnPageProps {
  searchParams: Promise<{
    order?: string;
    email?: string;
  }>;
}

export default async function GuestReturnPage({ searchParams }: GuestReturnPageProps) {
  const params = await searchParams;
  const orderNumber = params.order;
  const email = params.email;

  let order = null;
  let returns = null;
  let error = null;

  // If order number and email provided, verify and fetch order
  if (orderNumber && email) {
    const supabase = await createClient();

    // Look up order by order number and email
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .or(`order_number.eq.${orderNumber},id.eq.${orderNumber}`)
      .eq('customer_email', email.toLowerCase())
      .single();

    if (orderError || !orderData) {
      error = 'Order not found. Please check your order number and email address.';
    } else {
      order = orderData;

      // Fetch any existing returns for this order
      const { data: returnsData } = await supabase
        .from('returns')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });

      returns = returnsData || [];
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/track-order">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order Lookup
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Guest Return</h1>
        <p className="text-muted-foreground mt-2">
          Initiate a return for your order without an account
        </p>
      </div>

      {!order ? (
        /* Show lookup form */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Find Your Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GuestReturnForm />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900">Order Not Found</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Show order details with return option */
        <div className="space-y-8">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order.order_number || order.id.slice(0, 8)}</CardTitle>
                <Badge 
                  variant="secondary"
                  className={ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.color}
                >
                  {ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.label || order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  {order.customer_email}
                </p>
                <p>
                  <span className="text-muted-foreground">Order Date:</span>{' '}
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                {order.delivered_at && (
                  <p>
                    <span className="text-muted-foreground">Delivered:</span>{' '}
                    {new Date(order.delivered_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Returns */}
          {returns && returns.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Returns</h2>
              {returns.map((ret) => (
                <Card key={ret.id}>
                  <CardContent className="pt-6">
                    <ReturnStatusTimeline return={ret} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Eligibility Check */}
          {order.status === 'delivered' && order.delivered_at ? (
            <Card>
              <CardHeader>
                <CardTitle>Return Eligibility</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const deliveredDate = new Date(order.delivered_at);
                  const now = new Date();
                  const diffDays = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
                  const daysRemaining = 30 - diffDays;

                  if (daysRemaining > 0) {
                    return (
                      <div className="space-y-4">
                        <p className="text-green-700 bg-green-50 p-4 rounded-lg">
                          ✓ Your order is eligible for return. You have{' '}
                          <strong>{daysRemaining} days remaining</strong> to initiate a return.
                        </p>
                        <Link 
                          href={`/guest-return/${order.id}/request?email=${encodeURIComponent(email || '')}`}
                        >
                          <Button className="w-full" size="lg">
                            Start Return Process
                          </Button>
                        </Link>
                      </div>
                    );
                  } else {
                    return (
                      <p className="text-yellow-700 bg-yellow-50 p-4 rounded-lg">
                        Your order was delivered on {deliveredDate.toLocaleDateString()}. 
                        The 30-day return window has expired.
                      </p>
                    );
                  }
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-yellow-700 bg-yellow-50 p-4 rounded-lg">
                  Returns can only be initiated for delivered orders. This order is currently{' '}
                  <strong>{order.status}</strong>.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

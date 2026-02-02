/**
 * Guest Return Request Page
 * Story 6.4: Returns & Refunds Processing - AC-7
 * 
 * Allows guest customers to submit a return request without authentication.
 * Verifies order ownership via order ID + email before allowing submission.
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { GuestReturnRequestForm } from '@/components/returns/guest-return-request-form';

interface GuestReturnRequestPageProps {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function GuestReturnRequestPage({ 
  params, 
  searchParams 
}: GuestReturnRequestPageProps) {
  const { orderId } = await params;
  const { email } = await searchParams;

  // Validate required parameters
  if (!email) {
    redirect('/guest-return');
  }

  const supabase = await createClient();

  // Fetch order with items, verifying email matches
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('id', orderId)
    .eq('customer_email', email.toLowerCase())
    .single();

  if (orderError || !order) {
    redirect('/guest-return');
  }

  // Check if order is delivered
  if (order.status !== 'delivered' || !order.delivered_at) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/guest-return">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order Lookup
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              Order Not Eligible for Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Returns can only be initiated for delivered orders. This order is currently{' '}
              <strong>{order.status}</strong>.
            </p>
            <Button asChild className="mt-4">
              <Link href="/guest-return">
                Back to Order Lookup
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check return window (30 days from delivery)
  const deliveredDate = new Date(order.delivered_at);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = 30 - diffDays;

  if (daysRemaining <= 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/guest-return">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order Lookup
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              Return Window Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your order was delivered on {deliveredDate.toLocaleDateString()}. 
              The 30-day return window has expired.
            </p>
            <Button asChild className="mt-4">
              <Link href="/guest-return">
                Back to Order Lookup
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/guest-return?order=${order.order_number || order.id}&email=${encodeURIComponent(email)}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Order Details
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Request a Return</h1>
        <p className="text-muted-foreground mt-2">
          Order #{order.order_number || order.id.slice(0, 8)} • {email}
        </p>
      </div>

      {/* Return Window Notice */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-700">
          ✓ Your order is eligible for return. You have{' '}
          <strong>{daysRemaining} days remaining</strong> to complete this return request.
        </p>
      </div>

      {/* Return Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Return Details</CardTitle>
        </CardHeader>
        <CardContent>
          <GuestReturnRequestForm 
            order={order} 
            customerEmail={email}
          />
        </CardContent>
      </Card>
    </div>
  );
}

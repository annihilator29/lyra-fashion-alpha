/**
 * Order Confirmation Page Content
 * Story 3-4: Order Confirmation & Email Notification
 * Displays order details, factory messaging, and next steps
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/cart-store';

interface OrderConfirmationContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
}

export function OrderConfirmationContent({ order }: OrderConfirmationContentProps) {
  const { clearCart } = useCartStore();
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Clear cart on confirmation page load (once)
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger email confirmation if not already sent
  useEffect(() => {
    const sendConfirmationEmail = async () => {
      try {
        const response = await fetch('/api/send-order-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        });

        const result = await response.json();

        if (result.data) {
          setIsEmailSent(true);
          toast.success('Order confirmation sent to your email');
        }
      } catch (error) {
        console.error('Failed to send confirmation email:', error);
        toast.error('Unable to send confirmation email');
      }
    };

    if (!isEmailSent) {
      sendConfirmationEmail();
    }
  }, [order.id, isEmailSent]);

  // Calculate estimated delivery date (7-14 business days)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 14);
  const estimatedDeliveryMin = new Date();
  estimatedDeliveryMin.setDate(estimatedDeliveryMin.getDate() + 7);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="container mx-auto max-w-4xl px-4">
        {/* Order Number Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmation
          </h1>
          <p className="text-lg text-gray-600">
            Order #{order.order_number}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="text-base font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-green-800">
                  ${(order.total / 100).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-base font-medium capitalize">
                  {order.status.replace(/_/g, ' ')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-base font-medium">
                {order.shipping_address?.full_name}
              </p>
              <p className="text-gray-700">
                {order.shipping_address?.address_line1}
              </p>
              {order.shipping_address?.address_line2 && (
                <p className="text-gray-700">
                  {order.shipping_address.address_line2}
                </p>
              )}
              <p className="text-gray-700">
                {order.shipping_address?.city},{' '}
                {order.shipping_address?.state}{' '}
                {order.shipping_address?.postal_code}
              </p>
              <p className="text-gray-700">
                {order.shipping_address?.country}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items in Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-200">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {order.order_items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-4"
                >
                  {/* Product Image */}
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={
                        item.products?.images?.[0] || '/images/placeholder.jpg'
                      }
                      alt={item.products?.name}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.products?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.variant?.size} / {item.variant?.color}
                    </p>
                  </div>

                  {/* Quantity and Price */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Factory-Direct Messaging */}
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364 0L12 3.636l-7.682 7.682zM12 15.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm1-5.5a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your order is being crafted with care
            </h2>
            <p className="text-gray-700">
              Your pieces are being carefully crafted at our partner factory in
              Nepal, where skilled artisans bring decades of expertise to every
              stitch.
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 text-sm font-bold">
                  1
                </span>
                <p className="text-gray-700">
                  <strong>Production Phase:</strong> Your order is being
                  crafted with care at our partner factory in Nepal
                  (typically 7-10 business days)
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 text-sm font-bold">
                  2
                </span>
                <p className="text-gray-700">
                  <strong>Quality Check:</strong> Each piece undergoes a
                  thorough quality inspection before shipping
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 text-sm font-bold">
                  3
                </span>
                <p className="text-gray-700">
                  <strong>Shipping:</strong> Order ships via express delivery
                  with tracking information
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 text-sm font-bold">
                  4
                </span>
                <p className="text-gray-700">
                  <strong>Estimated Delivery:</strong>{' '}
                  {estimatedDeliveryMin.toLocaleDateString()} -{' '}
                  {estimatedDelivery.toLocaleDateString()} (7-14 business days)
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 text-sm font-bold">
                  5
                </span>
                <p className="text-gray-700">
                  <strong>Tracking Notification:</strong> You&apos;ll receive an email
                  with tracking information when your order ships
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Continue Shopping CTA */}
        <div className="text-center">
          <Link href="/products">
            <Button size="lg" className="min-w-48">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import GuestOrderLookupForm from '@/components/account/GuestOrderLookupForm';
import OrderStatusTimeline from '@/components/account/OrderStatusTimeline';
import OrderItemsList from '@/components/account/OrderItemsList';
import ShippingAddressDisplay from '@/components/account/ShippingAddressDisplay';
import TrackingLink from '@/components/account/TrackingLink';
import { Button } from '@/components/ui/button';
import type { OrderWithItems } from '@/types/order';

export default function GuestOrderTrackingPage() {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (orderNumber: string, email: string) => {
    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderNumber, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found. Please check your order number and email address.');
        } else if (response.status === 403) {
          setError('Email address does not match the order. Please use the email address from your order confirmation.');
        } else {
          setError(data.error || 'Failed to look up order. Please try again.');
        }
        return;
      }

      setOrder(data.order);
    } catch (err) {
      setError('An error occurred while looking up your order. Please try again later.');
      console.error('Order lookup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setOrder(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="mt-2 text-gray-600">
            Enter your order details to check the status of your purchase
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {!order ? (
            // Lookup Form
            <div className="p-6 sm:p-8">
              <GuestOrderLookupForm
                onSubmit={handleLookup}
                isLoading={isLoading}
                error={error}
              />
            </div>
          ) : (
            // Order Details
            <div className="p-6 sm:p-8">
              {/* Back Button */}
              <Button
                variant="ghost"
                className="mb-6 -ml-2"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Track Another Order
              </Button>

              {/* Order Header */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order #{order.order_number || order.id.slice(0, 8)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(order.total / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                <OrderStatusTimeline order={order} />
              </div>

              {/* Tracking Information */}
              {(order.status === 'shipped' || order.status === 'delivered') && order.tracking_number && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Tracking Information</h3>
                  <TrackingLink
                    trackingNumber={order.tracking_number}
                    carrier={order.carrier || undefined}
                  />
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                  <OrderItemsList order={order} />
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                  {order.shipping_address && (
                    <ShippingAddressDisplay address={order.shipping_address} />
                  )}
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  For security reasons, payment details are not displayed on the tracking page.{' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    Contact support
                  </Link>{' '}
                  for billing inquiries.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sign In Prompt */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>{' '}
            to view all your orders and manage your account.
          </p>
        </div>
      </div>
    </div>
  );
}

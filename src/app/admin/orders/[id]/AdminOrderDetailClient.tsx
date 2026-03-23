/**
 * Admin Order Detail Page - Enhanced
 * Story 7.3: Order Management & Fulfillment Tools
 * AC2: Order Detail View, AC3: Status Updates, AC4: Shipping, AC5: Refunds, AC8: Internal Notes
 * 
 * Comprehensive order management interface:
 * - Complete order information display
 * - Status updates with validation
 * - Shipping & tracking management
 * - Refund processing via Stripe
 * - Internal notes (admin-only)
 * - Order timeline
 * - Customer order history
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, User, FileText } from 'lucide-react';
import type { OrderWithItems } from '@/types/order';
import { OrderTimeline } from '@/components/admin/orders/order-timeline';
import { StatusUpdateDialog } from '@/components/admin/orders/status-update-dialog';
import { ShippingForm } from '@/components/admin/orders/shipping-form';
import { RefundForm } from '@/components/admin/orders/refund-form';
import { InternalNotes } from '@/components/admin/orders/internal-notes';
import type { InternalNote as InternalNoteType } from '@/app/admin/orders/actions';
import { getStorageImageUrl } from '@/lib/utils/image';

interface AdminOrderDetailPageProps {
  order: OrderWithItems;
  notes?: InternalNoteType[];
}

export default function AdminOrderDetailPage({ order, notes = [] }: AdminOrderDetailPageProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Order #{order.order_number || order.id.slice(0, 8)}
              </h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <StatusUpdateDialog
            orderId={order.id}
            currentStatus={order.status}
            onSuccess={handleSuccess}
          />
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order Info & Actions */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{order.customer_email || 'N/A'}</p>
              </div>
              {order.shipping_address?.phone && (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.shipping_address.phone}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Customer ID</p>
                <p className="font-medium font-mono text-xs">
                  {order.customer_id || 'Guest Checkout'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {order.shipping_address ? (
                <address className="not-italic space-y-1">
                  <p className="font-medium">
                    {order.shipping_address.name}
                  </p>
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && (
                    <p>{order.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state}{' '}
                    {order.shipping_address.postal_code}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </address>
              ) : (
                <p className="text-muted-foreground">
                  No shipping address available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                <FileText className="h-4 w-4 inline mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(order.total / 100).toFixed(2)}</span>
              </div>
              {order.tax && order.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${(order.tax / 100).toFixed(2)}</span>
                </div>
              )}
              {order.shipping && order.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${(order.shipping / 100).toFixed(2)}</span>
                </div>
              )}
              {order.refunded_amount && order.refunded_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span className="text-muted-foreground">Refunded</span>
                  <span>-${(order.refunded_amount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-medium">
                <span>Total</span>
                <span>${(order.total / 100).toFixed(2)}</span>
              </div>
              {order.payment_status && (
                <div className="pt-2 mt-2 border-t">
                  <p className="text-xs text-muted-foreground">Payment Status</p>
                  <p className="font-medium capitalize">{order.payment_status}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ShippingForm order={order} onSuccess={handleSuccess} />
              <RefundForm order={order} onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Timeline & Items */}
        <div className="space-y-6">
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b last:border-0"
                    >
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.products?.images?.[0] ? (
                          <img
                            src={item.products.images[0].startsWith('/') || item.products.images[0].startsWith('http') ? item.products.images[0] : getStorageImageUrl(item.products.images[0])}
                            alt={item.products.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{item.product_name || item.products?.name}</p>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">
                            {item.variant.size && <span>Size: {item.variant.size}</span>}
                            {item.variant.size && item.variant.color && <span> • </span>}
                            {item.variant.color && <span>Color: {item.variant.color}</span>}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-medium">
                          ${(item.price / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No items found
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Internal Notes */}
        <div>
          <InternalNotes orderId={order.id} initialNotes={notes} />
        </div>
      </div>
    </div>
  );
}

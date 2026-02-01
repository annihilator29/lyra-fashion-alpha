/**
 * Admin Order Detail Page
 * Story 6.1: Order Status Tracking System (Task 6)
 * 
 * Admin interface for viewing order details and updating status
 * - View complete order information
 * - Update order status with dropdown
 * - Add tracking information for shipped status
 * - Protected with admin role check
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Truck, Save, Loader2 } from 'lucide-react';
import { ORDER_STATUS_CONFIG, type OrderStatus, type OrderWithItems } from '@/types/order';
import OrderStatusTimeline from '@/components/account/OrderStatusTimeline';
import OrderItemsList from '@/components/account/OrderItemsList';
import ShippingAddressDisplay from '@/components/account/ShippingAddressDisplay';

interface AdminOrderDetailPageProps {
  order: OrderWithItems;
}

export default function AdminOrderDetailPage({ order }: AdminOrderDetailPageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [carrier, setCarrier] = useState(order.carrier || '');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(
    order.estimated_delivery_date 
      ? new Date(order.estimated_delivery_date).toISOString().split('T')[0]
      : ''
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          trackingNumber: status === 'shipped' || status === 'delivered' ? trackingNumber : undefined,
          carrier: status === 'shipped' || status === 'delivered' ? carrier : undefined,
          estimatedDeliveryDate: estimatedDeliveryDate || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order status');
      }

      setUpdateSuccess(true);
      router.refresh();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions: OrderStatus[] = ['pending', 'production', 'quality_check', 'shipped', 'delivered', 'cancelled'];

  const showTrackingFields = status === 'shipped' || status === 'delivered';

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
                })}
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary"
            className={ORDER_STATUS_CONFIG[order.status]?.color}
          >
            {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
          </Badge>
        </div>
      </div>

      {updateSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          Order status updated successfully!
        </div>
      )}

      {updateError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {updateError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Status Update */}
        <div className="space-y-6">
          {/* Status Update Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORDER_STATUS_CONFIG[s]?.label || s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showTrackingFields && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">
                      <Truck className="h-4 w-4 inline mr-2" />
                      Tracking Number
                    </Label>
                    <Input
                      id="trackingNumber"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g., 1Z999AA10123456784"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carrier">Carrier</Label>
                    <Select value={carrier} onValueChange={setCarrier}>
                      <SelectTrigger id="carrier">
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ups">UPS</SelectItem>
                        <SelectItem value="fedex">FedEx</SelectItem>
                        <SelectItem value="usps">USPS</SelectItem>
                        <SelectItem value="dhl">DHL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
                <Input
                  id="estimatedDelivery"
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                />
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={isUpdating || (status === order.status && 
                  trackingNumber === (order.tracking_number || '') &&
                  carrier === (order.carrier || ''))}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {order.customer_email || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Customer ID:</span>{' '}
                  {order.customer_id || 'Guest Checkout'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusTimeline order={order} />
            </CardContent>
          </Card>

          {/* Two Column Layout for Items and Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderItemsList order={order} />
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                {order.shipping_address ? (
                  <ShippingAddressDisplay address={order.shipping_address} />
                ) : (
                  <p className="text-muted-foreground">No shipping address available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(order.total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">${(order.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

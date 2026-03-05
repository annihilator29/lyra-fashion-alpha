/**
 * Shipping Form Component
 * Story 7.3: Order Management & Fulfillment Tools
 * AC4: Shipping & Tracking Management
 */

'use client';

import * as React from 'react';
import { Loader2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { addTrackingInfo } from '@/app/admin/orders/actions';
import { PackingSlipButton } from '@/components/admin/orders/packing-slip-button';
import { toast } from 'sonner';
import type { OrderWithItems } from '@/types/order';

interface ShippingFormProps {
  order: OrderWithItems;
  onSuccess?: () => void;
}

const CARRIERS = [
  { value: 'fedex', label: 'FedEx' },
  { value: 'ups', label: 'UPS' },
  { value: 'usps', label: 'USPS' },
  { value: 'dhl', label: 'DHL' },
  { value: 'other', label: 'Other' },
];

export function ShippingForm({ order, onSuccess }: ShippingFormProps) {
  const [open, setOpen] = React.useState(false);
  const [carrier, setCarrier] = React.useState('');
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const isShipped = order.status === 'shipped' || order.status === 'delivered';
  const hasTracking = order.tracking_number && order.carrier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!carrier || !trackingNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (trackingNumber.length < 5) {
      toast.error('Tracking number must be at least 5 characters');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await addTrackingInfo(order.id, carrier, trackingNumber);

      if (result.success) {
        toast.success(result.message || 'Tracking information added');
        setOpen(false);
        setCarrier('');
        setTrackingNumber('');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to add tracking information');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Shipping form error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">
          <Truck className="h-4 w-4 inline mr-2" />
          Shipping & Tracking
        </CardTitle>
        {hasTracking && (
          <PackingSlipButton order={order} />
        )}
      </CardHeader>
      <CardContent>
        {isShipped && hasTracking ? (
          // Display existing tracking info
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">
                  Order Shipped
                </p>
                <p className="text-xs text-green-700">
                  {order.carrier?.toUpperCase()} - {order.tracking_number}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={getTrackingUrl(order.carrier || '', order.tracking_number || '')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Track Package
                </a>
              </Button>
            </div>
            
            {!open && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    Update Tracking Information
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        ) : (
          // Show shipping form
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Truck className="h-4 w-4 mr-2" />
                Add Shipping Information
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Shipping Information</DialogTitle>
                <DialogDescription>
                  Enter the carrier and tracking number for this order. This will
                  automatically mark the order as shipped.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrier">Carrier *</Label>
                    <Select value={carrier} onValueChange={setCarrier}>
                      <SelectTrigger id="carrier">
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARRIERS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tracking">Tracking Number *</Label>
                    <Input
                      id="tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g., 1Z999AA10123456784"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 5 characters
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Truck className="mr-2 h-4 w-4" />
                        Mark as Shipped
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Get tracking URL for carrier
 */
function getTrackingUrl(carrier: string | null, trackingNumber: string): string {
  if (!carrier || !trackingNumber) return '#';

  const carrierUrls: Record<string, string> = {
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    other: '#',
  };

  return carrierUrls[carrier.toLowerCase()] || '#';
}

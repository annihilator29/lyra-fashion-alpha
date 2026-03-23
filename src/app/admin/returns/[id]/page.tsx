/**
 * Admin Return Detail/Inspection Page
 * Story 6.4: Returns & Refunds Processing (Task 7)
 * 
 * Admin interface for processing individual return requests:
 * - View return details and customer information
 * - Generate shipping labels (for approved returns)
 * - Inspect returned items
 * - Approve/reject returns
 * - Process refunds
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Package, 
  User, 
  DollarSign, 
  Truck,
  FileText,
  CheckCircle,
  XCircle,
  Printer
} from 'lucide-react';
import { RETURN_STATUS_CONFIG, RETURN_REASON_LABELS, type ReturnStatus, type ReturnReason } from '@/types/returns';
import { ReturnInspectionForm } from '@/components/returns/return-inspection-form';
import { getStorageImageUrl } from '@/lib/utils/image';

interface AdminReturnDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminReturnDetailPage({ params }: AdminReturnDetailPageProps) {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  const { id } = await params;
  const supabase = await createClient();

  // Fetch return with order and items
  const { data: returnData, error } = await supabase
    .from('returns')
    .select(`
      *,
      order:orders(
        id,
        order_number,
        customer_id,
        customer_email,
        total,
        shipping_address,
        delivered_at,
        order_items(
          id,
          product_id,
          quantity,
          price,
          variant,
          products(
            id,
            name,
            images,
            final_sale
          )
        )
      ),
      inspector:profiles(
        id,
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error || !returnData) {
    notFound();
  }

  const order = returnData.order;
  const returnableItems = order.order_items?.filter(
    (item: { id: string }) => returnData.order_item_ids.includes(item.id)
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/returns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Returns
            </Button>
          </Link>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Return {returnData.rma_number}</h1>
              <Badge 
                variant="secondary"
                className={RETURN_STATUS_CONFIG[returnData.status as ReturnStatus]?.color}
              >
                {RETURN_STATUS_CONFIG[returnData.status as ReturnStatus]?.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Order #{order.order_number || order.id.slice(0, 8)}
            </p>
          </div>

          {/* Action Buttons based on status */}
          <div className="flex gap-2">
            {returnData.status === 'requested' && (
              <Link href={`/api/returns/${id}/generate-label`}>
                <Button>
                  <Truck className="h-4 w-4 mr-2" />
                  Approve & Generate Label
                </Button>
              </Link>
            )}
            {returnData.shipping_label_url && (
              <a 
                href={returnData.shipping_label_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Label
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Return Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Being Returned */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items Being Returned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnableItems.map((item: {
                  id: string;
                  quantity: number;
                  price: number;
                  variant: { size?: string; color?: string } | null;
                  products: { id: string; name: string; images: string[] } | null;
                }) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    {item.products?.images?.[0] && (
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.products.images[0].startsWith('/') || item.products.images[0].startsWith('http') ? item.products.images[0] : getStorageImageUrl(item.products.images[0])}
                          alt={item.products.name}
                          width={80}
                          height={80}
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.products?.name || 'Unknown Product'}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.size && item.variant.color && ' | '}
                          {item.variant.color && `Color: ${item.variant.color}`}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Refund Amount</span>
                  <span className="text-xl font-bold">${returnData.refund_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Return Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Return Reason</p>
                  <p className="font-medium">
                    {RETURN_REASON_LABELS[returnData.reason as ReturnReason] || returnData.reason}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested Date</p>
                  <p className="font-medium">
                    {new Date(returnData.requested_at).toLocaleDateString()}
                  </p>
                </div>
                {returnData.condition_notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Condition Notes</p>
                    <p className="font-medium">{returnData.condition_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {(returnData.tracking_number || returnData.shipping_label_url) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {returnData.tracking_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="font-medium">{returnData.tracking_number}</p>
                    </div>
                  )}
                  {returnData.tracking_url && (
                    <div>
                      <a 
                        href={returnData.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Track Package
                      </a>
                    </div>
                  )}
                  {returnData.shipping_label_url && (
                    <div>
                      <a 
                        href={returnData.shipping_label_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Download Shipping Label
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inspection Form - Show when status is 'received' */}
          {returnData.status === 'received' && (
            <ReturnInspectionForm 
              returnId={returnData.id}
              refundAmount={returnData.refund_amount}
            />
          )}

          {/* Inspection Results - Show when already inspected */}
          {(returnData.status === 'inspected' || returnData.status === 'refunded') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Inspection Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {returnData.inspection_notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Inspection Notes</p>
                      <p className="font-medium">{returnData.inspection_notes}</p>
                    </div>
                  )}
                  {returnData.inspected_by && (
                    <div>
                      <p className="text-sm text-muted-foreground">Inspected By</p>
                      <p className="font-medium">
                        {returnData.inspector?.full_name || returnData.inspector?.email || 'Admin'}
                      </p>
                    </div>
                  )}
                  {returnData.inspected_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Inspection Date</p>
                      <p className="font-medium">
                        {new Date(returnData.inspected_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection Details */}
          {returnData.status === 'rejected' && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-5 w-5" />
                  Return Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {returnData.rejection_reason && (
                    <div>
                      <p className="text-sm text-red-700">Rejection Reason</p>
                      <p className="font-medium text-red-900">{returnData.rejection_reason}</p>
                    </div>
                  )}
                  {returnData.inspection_notes && (
                    <div>
                      <p className="text-sm text-red-700">Inspection Notes</p>
                      <p className="text-red-900">{returnData.inspection_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer Info & Order Summary */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customer_email || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Delivered</p>
                  <p className="font-medium">
                    {order.delivered_at 
                      ? new Date(order.delivered_at).toLocaleDateString()
                      : 'Not delivered'
                    }
                  </p>
                </div>
                <Link href={`/admin/orders/${order.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View Order Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.shipping_address?.name}</p>
                <p>{order.shipping_address?.address_line1}</p>
                {order.shipping_address?.address_line2 && (
                  <p>{order.shipping_address.address_line2}</p>
                )}
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
                  {order.shipping_address?.postal_code}
                </p>
                <p>{order.shipping_address?.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Refund Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Refund Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Refund Amount</span>
                  <span className="font-bold">${returnData.refund_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge 
                    variant={returnData.status === 'refunded' ? 'default' : 'secondary'}
                  >
                    {returnData.status === 'refunded' ? 'Refunded' : 'Pending'}
                  </Badge>
                </div>
                {returnData.stripe_refund_id && (
                  <div>
                    <p className="text-xs text-muted-foreground">Transaction ID</p>
                    <p className="text-xs font-mono">{returnData.stripe_refund_id}</p>
                  </div>
                )}
                {returnData.refunded_at && (
                  <div>
                    <p className="text-xs text-muted-foreground">Refunded On</p>
                    <p className="text-sm">{new Date(returnData.refunded_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

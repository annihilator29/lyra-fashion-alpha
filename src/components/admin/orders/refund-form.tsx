/**
 * Refund Form Component
 * Story 7.3: Order Management & Fulfillment Tools
 * AC5: Refund & Return Processing
 */

'use client';

import * as React from 'react';
import { Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { processRefund } from '@/app/admin/orders/actions';
import { toast } from 'sonner';
import type { OrderWithItems } from '@/types/order';

interface RefundFormProps {
  order: OrderWithItems;
  onSuccess?: () => void;
}

const REFUND_REASONS = [
  { value: 'defective', label: 'Defective/Damaged Item' },
  { value: 'wrong_item', label: 'Wrong Item Sent' },
  { value: 'changed_mind', label: 'Customer Changed Mind' },
  { value: 'other', label: 'Other' },
];

export function RefundForm({ order, onSuccess }: RefundFormProps) {
  const [open, setOpen] = React.useState(false);
  const [refundAmount, setRefundAmount] = React.useState('');
  const [refundReason, setRefundReason] = React.useState('');
  const [refundNotes, setRefundNotes] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const orderTotal = order.total / 100;
  const refundedAmount = (order.refunded_amount || 0) / 100;
  const maxRefund = orderTotal - refundedAmount;

  const handleReset = () => {
    setRefundAmount('');
    setRefundReason('');
    setRefundNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(refundAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (amount > maxRefund) {
      toast.error(`Refund amount cannot exceed $${maxRefund.toFixed(2)}`);
      return;
    }

    if (!refundReason) {
      toast.error('Please select a refund reason');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processRefund(
        order.id,
        amount,
        refundReason as any,
        refundNotes
      );

      if (result.success) {
        toast.success(result.message || 'Refund processed successfully');
        setOpen(false);
        handleReset();
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to process refund');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Refund error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          <DollarSign className="h-4 w-4 inline mr-2" />
          Refund Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Refund Summary */}
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Total:</span>
            <span className="font-medium">${orderTotal.toFixed(2)}</span>
          </div>
          {refundedAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Refunded:</span>
              <span className="font-medium">${refundedAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="font-medium">Available for Refund:</span>
            <span className="font-medium text-green-600">
              ${maxRefund.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Refund Button/Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={maxRefund <= 0}>
              Process Refund
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
              <DialogDescription>
                Process a refund for this order via Stripe. The refund will be
                processed immediately.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Refund Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Refund Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={maxRefund}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maximum: ${maxRefund.toFixed(2)}
                  </p>
                </div>

                {/* Refund Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason">Refund Reason *</Label>
                  <Select value={refundReason} onValueChange={setRefundReason}>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFUND_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    placeholder="Additional notes about this refund..."
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {refundNotes.length}/500 characters
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    handleReset();
                  }}
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
                      <DollarSign className="mr-2 h-4 w-4" />
                      Process Refund
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {maxRefund <= 0 && (
          <p className="text-sm text-muted-foreground text-center">
            This order has been fully refunded
          </p>
        )}
      </CardContent>
    </Card>
  );
}

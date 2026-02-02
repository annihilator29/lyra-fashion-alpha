'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateReturnStatus } from '@/lib/returns/mutations';
import { processStripeRefund } from '@/app/actions/returns';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ReturnInspectionFormProps {
  returnId: string;
  refundAmount: number;
}

export function ReturnInspectionForm({ returnId, refundAmount }: ReturnInspectionFormProps) {
  const router = useRouter();
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // First update status to inspected
      const statusResult = await updateReturnStatus(returnId, {
        status: 'inspected',
        inspectionNotes: inspectionNotes || undefined,
      });

      if (!statusResult.success) {
        toast.error(statusResult.message || 'Failed to update status');
        return;
      }

      // Then process the refund
      const refundResult = await processStripeRefund(returnId);

      if (refundResult.success) {
        toast.success('Return approved and refund processed successfully!');
        router.refresh();
      } else {
        toast.error(refundResult.message || 'Failed to process refund');
      }
    } catch (error) {
      toast.error('An error occurred while processing');
      console.error('Inspection approval error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await updateReturnStatus(returnId, {
        status: 'rejected',
        rejectionReason: rejectionReason,
        inspectionNotes: inspectionNotes || undefined,
      });

      if (result.success) {
        toast.success('Return rejected. Customer will be notified.');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to reject return');
      }
    } catch (error) {
      toast.error('An error occurred while rejecting');
      console.error('Inspection rejection error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <CheckCircle className="h-5 w-5" />
          Item Inspection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Inspection Notes */}
          <div>
            <Label htmlFor="inspection-notes">Inspection Notes</Label>
            <Textarea
              id="inspection-notes"
              placeholder="Describe the condition of the returned items..."
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
              rows={3}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Note items&apos; condition, tags, signs of wear, etc.
            </p>
          </div>

          {/* Rejection Reason (only shown if rejecting) */}
          <div>
            <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={2}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Required if rejecting. Will be shared with the customer.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Refund ${refundAmount.toFixed(2)}
                </>
              )}
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Return
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Approving will process a refund of ${refundAmount.toFixed(2)} to the customer&apos;s original payment method.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

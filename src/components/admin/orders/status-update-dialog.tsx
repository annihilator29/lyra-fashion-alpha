/**
 * Status Update Dialog Component
 * Story 7.3: Order Management & Fulfillment Tools
 * AC3: Order Status Updates
 */

'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_CONFIG, type OrderStatus } from '@/types/order';
import { STATUS_TRANSITIONS } from '@/lib/orders/status-transitions';
import { updateOrderStatus } from '@/app/admin/orders/actions';
import { toast } from 'sonner';

interface StatusUpdateDialogProps {
  orderId: string;
  currentStatus: OrderStatus;
  onSuccess?: () => void;
}

export function StatusUpdateDialog({
  orderId,
  currentStatus,
  onSuccess,
}: StatusUpdateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Get valid transitions for current status
  const validTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  
  // Check if a status is a valid transition
  const isValidTransition = (status: OrderStatus) => {
    return status === currentStatus || validTransitions.includes(status);
  };

  // Get all status options with validation info
  const statusOptions = Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[];

  const handleUpdate = async () => {
    if (newStatus === currentStatus) {
      toast.error('No status change selected');
      return;
    }

    if (!isValidTransition(newStatus)) {
      toast.error(`Cannot transition from ${currentStatus} to ${newStatus}`);
      return;
    }

    setIsUpdating(true);

    try {
      const result = await updateOrderStatus(orderId, newStatus, notes);

      if (result.success) {
        toast.success(result.message || 'Status updated successfully');
        setOpen(false);
        setNotes('');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Status update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setNewStatus(currentStatus);
      setNotes('');
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Update Status
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order. Invalid transitions are disabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Status */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge variant="secondary" className={ORDER_STATUS_CONFIG[currentStatus]?.color}>
                {ORDER_STATUS_CONFIG[currentStatus]?.label}
              </Badge>
            </div>

            {/* New Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="new-status">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as OrderStatus)}
              >
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => {
                    const valid = isValidTransition(status);
                    return (
                      <SelectItem
                        key={status}
                        value={status}
                        disabled={!valid}
                      >
                        <div className="flex items-center gap-2">
                          {ORDER_STATUS_CONFIG[status]?.label}
                          {!valid && status !== currentStatus && (
                            <span className="text-muted-foreground text-xs">
                              (Not available)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {!isValidTransition(newStatus) && newStatus !== currentStatus && (
                <p className="text-sm text-destructive">
                  Cannot transition from {currentStatus} to {newStatus}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Status Change Notes
                <span className="text-muted-foreground font-normal ml-1">
                  (Optional, visible to customer in tracking)
                </span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                maxLength={500}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                isUpdating ||
                newStatus === currentStatus ||
                !isValidTransition(newStatus)
              }
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

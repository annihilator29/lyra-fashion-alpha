/**
 * Order Status Select Component
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC1: Recent Orders Display - Update Status, AC5: Order Status Management
 */

'use client';

import { useState, useCallback } from 'react';
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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';
import {
  validateStatusTransition,
  requiresConfirmation,
  getConfirmationMessage,
  STATUS_LABELS,
  ALL_ORDER_STATUSES,
} from '@/lib/orders/status-transitions';
import { ORDER_STATUS_COLORS } from '@/lib/constants/status-colors';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
  onChange: (status: OrderStatus) => Promise<void>;
  disabled?: boolean;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
  onChange,
  disabled = false,
}: OrderStatusSelectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle status selection
   */
  const handleStatusChange = useCallback(
    (newStatus: OrderStatus) => {
      setError(null);

      // Check if transition is valid
      const validation = validateStatusTransition(currentStatus, newStatus);

      if (!validation.valid) {
        setError(validation.error || 'Invalid status transition');
        return;
      }

      // Check if confirmation is required
      if (requiresConfirmation(currentStatus, newStatus)) {
        setPendingStatus(newStatus);
        setShowConfirmDialog(true);
      } else {
        // Direct update
        executeStatusChange(newStatus);
      }
    },
    [currentStatus]
  );

  /**
   * Execute the status change
   */
  const executeStatusChange = useCallback(
    async (status: OrderStatus) => {
      try {
        setIsLoading(true);
        setError(null);
        await onChange(status);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update status';
        setError(errorMessage);
        console.error('[OrderStatusSelect] Error:', err);
      } finally {
        setIsLoading(false);
        setPendingStatus(null);
        setShowConfirmDialog(false);
      }
    },
    [onChange]
  );

  /**
   * Handle confirmation dialog confirm
   */
  const handleConfirm = useCallback(() => {
    if (pendingStatus) {
      executeStatusChange(pendingStatus);
    }
  }, [pendingStatus, executeStatusChange]);

  /**
   * Handle confirmation dialog cancel
   */
  const handleCancel = useCallback(() => {
    setPendingStatus(null);
    setShowConfirmDialog(false);
    setError(null);
  }, []);

  /**
   * Get status badge color
   */
  const getStatusColor = (status: OrderStatus): string => {
    return ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || '#9CA3AF';
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <Select
          value={currentStatus}
          onValueChange={(value) => handleStatusChange(value as OrderStatus)}
          disabled={disabled || isLoading}
        >
          <SelectTrigger
            className={cn(
              'w-32 h-8 text-xs',
              isLoading && 'opacity-70 cursor-wait'
            )}
            data-testid={`status-select-${orderId}`}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(currentStatus) }}
                />
                <SelectValue />
              </div>
            )}
          </SelectTrigger>
          <SelectContent>
            {ALL_ORDER_STATUSES.map((status) => {
              const validation = validateStatusTransition(currentStatus, status);
              const isDisabled = !validation.valid && status !== currentStatus;

              return (
                <SelectItem
                  key={status}
                  value={status}
                  disabled={isDisabled}
                  className={cn(isDisabled && 'opacity-50')}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                    <span>{STATUS_LABELS[status]}</span>
                    {validation.warning && (
                      <span className="text-xs text-yellow-600">
                        (Warning)
                      </span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {error && (
          <span className="text-xs text-red-500" data-testid="status-error">
            {error}
          </span>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              {pendingStatus &&
                getConfirmationMessage(currentStatus, pendingStatus)}
            </DialogDescription>
          </DialogHeader>

          {pendingStatus && (
            <div className="py-4">
              <p className="text-sm">
                Current:{' '}
                <span className="font-medium">
                  {STATUS_LABELS[currentStatus]}
                </span>
              </p>
              <p className="text-sm">
                New:{' '}
                <span className="font-medium">
                  {STATUS_LABELS[pendingStatus]}
                </span>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              data-testid="confirm-status"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

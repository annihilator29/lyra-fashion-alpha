'use client';

import { cn } from '@/lib/utils';
import type { Return, ReturnStatus } from '@/types/returns';
import { RETURN_STATUS_CONFIG, RETURN_STATUS_FLOW } from '@/types/returns';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface ReturnStatusTimelineProps {
  return: Return;
}

export function ReturnStatusTimeline({ return: returnData }: ReturnStatusTimelineProps) {
  const currentStatus = returnData.status;
  const currentIndex = RETURN_STATUS_FLOW.indexOf(currentStatus);

  // Handle rejected status specially - show rejected instead of refunded
  const displayFlow: ReturnStatus[] = currentStatus === 'rejected' 
    ? [...RETURN_STATUS_FLOW.slice(0, -1), 'rejected' as ReturnStatus] 
    : RETURN_STATUS_FLOW;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {displayFlow.map((status, index) => {
          const config = RETURN_STATUS_CONFIG[status];
          const isCompleted = index < currentIndex;
          const isCurrent = status === currentStatus;
          const isPending = index > currentIndex;

          // Get timestamp for this status
          let timestamp: string | null = null;
          switch (status) {
            case 'requested':
              timestamp = returnData.requested_at;
              break;
            case 'approved':
              timestamp = returnData.approved_at;
              break;
            case 'shipped':
              timestamp = returnData.shipped_at;
              break;
            case 'received':
              timestamp = returnData.received_at;
              break;
            case 'inspected':
              timestamp = returnData.inspected_at;
              break;
            case 'refunded':
              timestamp = returnData.refunded_at;
              break;
            case 'rejected':
              timestamp = returnData.rejected_at;
              break;
          }

          return (
            <div
              key={status}
              className={cn(
                'flex items-start gap-4 p-4 rounded-lg border transition-all',
                isCurrent && 'border-primary bg-primary/5 ring-1 ring-primary',
                isCompleted && 'border-green-200 bg-green-50/50',
                isPending && 'border-gray-200 bg-gray-50/50 opacity-60'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : isCurrent ? (
                  <Clock className="w-6 h-6 text-primary animate-pulse" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Status Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={cn(
                    'font-semibold',
                    isCurrent && 'text-primary',
                    isCompleted && 'text-green-700',
                    isPending && 'text-gray-600'
                  )}>
                    {config.label}
                    {isCurrent && (
                      <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-primary/10 rounded-full">
                        Current
                      </span>
                    )}
                  </h4>
                  {timestamp && (
                    <time className="text-sm text-muted-foreground flex-shrink-0">
                      {new Date(timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {config.description}
                </p>

                {/* Additional Info for Current Status */}
                {isCurrent && status === 'approved' && returnData.shipping_label_url && (
                  <a
                    href={returnData.shipping_label_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                  >
                    Download Shipping Label
                  </a>
                )}

                {isCurrent && status === 'shipped' && returnData.tracking_number && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Tracking: </span>
                    {returnData.tracking_url ? (
                      <a
                        href={returnData.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {returnData.tracking_number}
                      </a>
                    ) : (
                      <span>{returnData.tracking_number}</span>
                    )}
                  </div>
                )}

                {isCurrent && status === 'inspected' && returnData.inspection_notes && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    <strong>Inspection Notes:</strong> {returnData.inspection_notes}
                  </p>
                )}

                {isCurrent && status === 'rejected' && returnData.rejection_reason && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <strong className="text-red-800">Rejection Reason:</strong>
                    <p className="text-red-700 mt-1">{returnData.rejection_reason}</p>
                  </div>
                )}

                {isCurrent && status === 'refunded' && returnData.refund_amount && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm">
                    <strong className="text-green-800">Refund Amount:</strong>
                    <p className="text-green-700 mt-1">${returnData.refund_amount.toFixed(2)}</p>
                    {returnData.stripe_refund_id && (
                      <p className="text-green-600 text-xs mt-1">
                        Transaction ID: {returnData.stripe_refund_id}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RMA Number Display */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">RMA Number:</span>
          <span className="font-mono font-semibold">{returnData.rma_number}</span>
        </div>
      </div>
    </div>
  );
}

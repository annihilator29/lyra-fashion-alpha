/**
 * Order Timeline Component
 * Story 7.3: Order Management & Fulfillment Tools
 * AC2: Order Detail View - Order timeline
 */

'use client';

import { CheckCircle2, Circle, Package, Truck, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_CONFIG, type OrderStatus, type OrderWithItems } from '@/types/order';
import { format } from 'date-fns';

interface OrderTimelineProps {
  order: OrderWithItems;
}

interface TimelineEvent {
  status: OrderStatus;
  label: string;
  date?: string | null;
  icon: React.ReactNode;
  description?: string;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const events: TimelineEvent[] = [
    {
      status: 'pending',
      label: 'Order Placed',
      date: order.created_at,
      icon: <Clock className="h-4 w-4" />,
      description: 'Order received',
    },
    {
      status: 'production',
      label: 'Production Started',
      date: order.production_started_at,
      icon: <Package className="h-4 w-4" />,
      description: 'Item is being crafted',
    },
    {
      status: 'quality_check',
      label: 'Quality Check',
      date: order.quality_checked_at,
      icon: <CheckCircle2 className="h-4 w-4" />,
      description: 'Quality inspection',
    },
    {
      status: 'shipped',
      label: 'Shipped',
      date: order.shipped_at,
      icon: <Truck className="h-4 w-4" />,
      description: order.tracking_number
        ? `${order.carrier?.toUpperCase()} - ${order.tracking_number}`
        : 'Package dispatched',
    },
    {
      status: 'delivered',
      label: 'Delivered',
      date: order.delivered_at,
      icon: <CheckCircle2 className="h-4 w-4" />,
      description: 'Package delivered',
    },
  ];

  // Add cancelled event if order is cancelled
  if (order.status === 'cancelled') {
    events.push({
      status: 'cancelled',
      label: 'Cancelled',
      date: order.updated_at,
      icon: <XCircle className="h-4 w-4" />,
      description: (order as any).status_notes || 'Order cancelled',
    });
  }

  // Determine current status index
  const statusIndex = events.findIndex((e) => e.status === order.status);

  return (
    <div className="space-y-4">
      {/* Current Status Badge */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Current Status</p>
          <p className="text-lg font-semibold">
            {ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.label || order.status}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.color}
        >
          {ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.label}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted">
          <div
            className="bg-primary transition-all duration-500"
            style={{
              height: `${((statusIndex + 1) / events.length) * 100}%`,
            }}
          />
        </div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const isCompleted = index <= statusIndex;
            const isCurrent = index === statusIndex;

            return (
              <div key={event.status} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted bg-background text-muted-foreground'
                  } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {isCompleted ? (
                    event.icon
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {event.label}
                    </p>
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>

                  {event.date && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}

                  {event.description && (
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Info */}
      {order.estimated_delivery_date && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Estimated Delivery
          </p>
          <p className="text-sm text-blue-700">
            {format(new Date(order.estimated_delivery_date), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      )}
    </div>
  );
}

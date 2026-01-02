'use client';

import { CheckCircle2, Package, FileCheck, Truck } from 'lucide-react';
import { type OrderStatus } from '@/types/order';

interface OrderStatusTimelineProps {
  order: {
    status: OrderStatus;
    ordered_at: string;
    production_started_at: string | null;
    quality_checked_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
  };
}

export default function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const steps = [
    {
      label: 'Order Received',
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: !!order.ordered_at,
      timestamp: order.ordered_at,
    },
    {
      label: 'Production',
      icon: <Package className="h-5 w-5" />,
      completed: !!order.production_started_at,
      timestamp: order.production_started_at,
    },
    {
      label: 'Quality Check',
      icon: <FileCheck className="h-5 w-5" />,
      completed: !!order.quality_checked_at,
      timestamp: order.quality_checked_at,
    },
    {
      label: 'Shipped',
      icon: <Truck className="h-5 w-5" />,
      completed: !!order.shipped_at,
      timestamp: order.shipped_at,
    },
    {
      label: 'Delivered',
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: !!order.delivered_at,
      timestamp: order.delivered_at,
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.label} className="flex items-start gap-4">
          <div
            className={`
              flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border-2
              ${step.completed ? 'bg-green-100 border-green-500 text-green-600' : 'bg-gray-100 border-gray-300 text-gray-400'}
            `}
          >
            {step.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-medium ${
                step.completed ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              {step.label}
            </h3>
            {step.timestamp && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(step.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

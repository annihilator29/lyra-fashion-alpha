'use client';

import { CheckCircle2, Package, FileCheck, Truck, Calendar } from 'lucide-react';
import { type OrderStatus } from '@/types/order';

interface OrderStatusTimelineProps {
  order: {
    status: OrderStatus;
    ordered_at: string;
    production_started_at: string | null;
    quality_checked_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    estimated_delivery_date: string | null;
  };
}

export default function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const steps = [
    {
      label: 'Order Received',
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: !!order.ordered_at,
      timestamp: order.ordered_at,
      isCurrent: order.status === 'pending',
    },
    {
      label: 'Production',
      icon: <Package className="h-5 w-5" />,
      completed: !!order.production_started_at,
      timestamp: order.production_started_at,
      isCurrent: order.status === 'production',
    },
    {
      label: 'Quality Check',
      icon: <FileCheck className="h-5 w-5" />,
      completed: !!order.quality_checked_at,
      timestamp: order.quality_checked_at,
      isCurrent: order.status === 'quality_check',
    },
    {
      label: 'Shipped',
      icon: <Truck className="h-5 w-5" />,
      completed: !!order.shipped_at,
      timestamp: order.shipped_at,
      isCurrent: order.status === 'shipped',
    },
    {
      label: 'Delivered',
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: !!order.delivered_at,
      timestamp: order.delivered_at,
      isCurrent: order.status === 'delivered',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Estimated Delivery Date Card */}
      {order.estimated_delivery_date && !order.delivered_at && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
              <p className="text-lg font-semibold text-blue-700">
                {new Date(order.estimated_delivery_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.label} className="relative flex items-start gap-4 mb-6 last:mb-0">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-5 top-10 w-0.5 h-8 -ml-px ${
                  step.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-hidden="true"
              />
            )}

            {/* Step Icon */}
            <div
              className={`
                flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center border-2 z-10
                ${step.completed
                  ? 'bg-green-100 border-green-500 text-green-600'
                  : step.isCurrent
                    ? 'bg-blue-100 border-blue-500 text-blue-600 ring-2 ring-blue-200'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }
              `}
            >
              {step.icon}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0 pt-1">
              <h3
                className={`text-sm font-medium ${
                  step.isCurrent
                    ? 'text-blue-700 font-semibold'
                    : step.completed
                      ? 'text-green-700'
                      : 'text-gray-500'
                }`}
              >
                {step.label}
                {step.isCurrent && (
                  <span className="ml-2 text-xs text-blue-600 font-normal">(Current)</span>
                )}
              </h3>
              {step.timestamp && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(step.timestamp)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

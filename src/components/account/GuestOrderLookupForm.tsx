'use client';

import { useState } from 'react';
import { Package, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrderLookupFormProps {
  onSubmit: (orderNumber: string, email: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function GuestOrderLookupForm({ onSubmit, isLoading, error }: OrderLookupFormProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    orderNumber?: string;
    email?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { orderNumber?: string; email?: string } = {};

    if (!orderNumber.trim()) {
      errors.orderNumber = 'Order number is required';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(orderNumber.trim(), email.trim().toLowerCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="orderNumber" className="text-sm font-medium">
          Order Number
        </Label>
        <div className="relative">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="orderNumber"
            type="text"
            placeholder="e.g., 12345 or ORD-2025-12345"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="pl-10"
            disabled={isLoading}
            aria-invalid={!!validationErrors.orderNumber}
            aria-describedby={validationErrors.orderNumber ? 'orderNumber-error' : undefined}
          />
        </div>
        {validationErrors.orderNumber && (
          <p id="orderNumber-error" className="text-sm text-red-600">
            {validationErrors.orderNumber}
          </p>
        )}
        <p className="text-xs text-gray-500">
          Found in your order confirmation email
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isLoading}
            aria-invalid={!!validationErrors.email}
            aria-describedby={validationErrors.email ? 'email-error' : undefined}
          />
        </div>
        {validationErrors.email && (
          <p id="email-error" className="text-sm text-red-600">
            {validationErrors.email}
          </p>
        )}
        <p className="text-xs text-gray-500">
          The email address used when placing the order
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Looking up order...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Track Order
          </>
        )}
      </Button>

      <div className="text-center text-sm text-gray-500">
        <p>
          Need help?{' '}
          <a href="mailto:support@lyrafashion.com" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </form>
  );
}

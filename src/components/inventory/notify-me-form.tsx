/**
 * Notify Me Form Component
 * 
 * Allows customers to sign up for restock notifications
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createStockNotification } from '@/lib/inventory';

interface NotifyMeFormProps {
  productId: string;
  variantId?: string;
  productName: string;
  className?: string;
}

export function NotifyMeForm({
  productId,
  variantId,
  productName,
  className,
}: NotifyMeFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    const result = await createStockNotification({
      productId,
      variantId,
      email,
    });

    setIsSubmitting(false);
    setStatus(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      setEmail('');
    }
  }

  return (
    <div className={cn('bg-gray-50 rounded-lg p-4', className)}>
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="font-semibold text-gray-900">Get notified when available</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        Enter your email and we&apos;ll notify you when {productName} is back in stock.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <Label htmlFor="notify-email" className="sr-only">
            Email address
          </Label>
          <Input
            id="notify-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          variant="outline"
        >
          {isSubmitting ? 'Subscribing...' : 'Notify Me'}
        </Button>

        {status !== 'idle' && (
          <div
            className={cn(
              'text-sm p-2 rounded',
              status === 'success' && 'bg-green-100 text-green-800',
              status === 'error' && 'bg-red-100 text-red-800'
            )}
            role="alert"
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

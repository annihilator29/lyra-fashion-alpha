'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface CheckoutData {
  items: Array<{
    id: string; // Cart item ID (composite: productId-size-color)
    productId: string; // Product UUID (actual product ID) - REQUIRED for proper order creation
    name: string;
    price: number;
    quantity: number;
    image?: string;
    variant?: {
      size: string;
      color: string;
    };
  }>;
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface SavedPaymentState {
  clientSecret?: string;
  orderId?: string;
  amount?: number;
}

interface CheckoutPaymentStepProps {
  checkoutData: CheckoutData;
  onPaymentSuccess: (orderId: string) => void;
  onBack: () => void;
  savedPaymentState?: SavedPaymentState;
  onSavePaymentState?: (state: Required<SavedPaymentState>) => void;
}

// Inner component that uses Stripe hooks - must be wrapped by Elements
interface PaymentFormInnerProps {
  checkoutData: CheckoutData;
  onPaymentSuccess: (orderId: string) => void;
  onBack: () => void;
  clientSecret: string;
  orderId: string;
}

const PaymentFormInner: React.FC<PaymentFormInnerProps> = ({
  checkoutData,
  onPaymentSuccess,
  onBack,
  orderId,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  // Payment error type mapping to user-friendly messages
  const getPaymentErrorMessage = (error: Error): string => {
    const lowerMessage = error.message.toLowerCase();

    // Stripe error code patterns
    if (lowerMessage.includes('card_declined') || lowerMessage.includes('declined')) {
      return 'Your card was declined. Please try a different payment method.';
    }
    if (lowerMessage.includes('insufficient_funds') || lowerMessage.includes('insufficient funds')) {
      return 'Insufficient funds. Please check your account balance or use a different card.';
    }
    if (lowerMessage.includes('expired_card') || lowerMessage.includes('expired')) {
      return 'Your card has expired. Please use a different payment method.';
    }
    if (lowerMessage.includes('incorrect_cvc') || lowerMessage.includes('cvc')) {
      return 'Your CVC is incorrect. Please check and try again.';
    }
    if (lowerMessage.includes('processing_error') || lowerMessage.includes('processing')) {
      return 'Payment processing failed. Please try again.';
    }
    if (lowerMessage.includes('network_error') || lowerMessage.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (lowerMessage.includes('rate_limit')) {
      return 'Too many payment attempts. Please wait a moment and try again.';
    }

    // Default generic message
    return 'Payment failed. Please try again or contact support if the issue persists.';
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system is not ready. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
          },
          redirect: 'if_required',
        });

        if (error) {
          // specific handling for validation errors - let Stripe UI show them
          if (error.type === 'validation_error') {
             throw error; // re-throw to be caught by outer catch but marked as validation
          }
          const userMessage = getPaymentErrorMessage(new Error(error.message || 'Payment failed'));
          throw new Error(userMessage);
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          toast.success('Your payment has been processed successfully.');
          onPaymentSuccess(orderId || paymentIntent.id);
        } else {
          throw new Error('Payment did not complete successfully');
        }
      } catch (error: unknown) {
         throw error; // Propagate to the main catch
      }
    } catch (error: unknown) {
      
      // Check if it's a validation error from Stripe
      const isValidationError = error !== null && typeof error === 'object' && 'type' in error && error.type === 'validation_error';
      
      const message = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      
      // Log the full error object for debugging (JSON.stringify hides Error properties)
      console.error('Payment error full details:', error);
      
      if (isValidationError) {
        toast.warning('Please check your payment details.');
        setIsLoading(false); // Explicitly reset loading state
        return;
      }

      // Toast already shown in retry logic, don't show again if it's a payment error
      if (!message.includes('declined') && !message.includes('insufficient')) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
          <div className="mt-6 flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
            >
              Back to Shipping
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : `Pay $${checkoutData.total.toFixed(2)}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checkoutData.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>${checkoutData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${checkoutData.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${checkoutData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span>${checkoutData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

// Outer component - handles payment intent creation and Elements wrapper
const CheckoutPaymentForm: React.FC<CheckoutPaymentStepProps> = ({
  checkoutData, 
  onPaymentSuccess, 
  onBack,
  savedPaymentState,
  onSavePaymentState
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const orderIdRef = useRef<string | null>(null);
  const initializingRef = useRef(false);

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      // Check if we can reuse saved state
      const currentAmountCents = Math.round(checkoutData.total * 100);
      const savedAmountCents = savedPaymentState?.amount ? Math.round(savedPaymentState.amount * 100) : null;

      // Logic to reuse existing payment intent if amount matches
      if (savedPaymentState?.clientSecret && 
          savedPaymentState?.orderId && 
          savedAmountCents === currentAmountCents) {
          
          console.log('Reusing existing payment intent', savedPaymentState.orderId);
          setClientSecret(savedPaymentState.clientSecret);
          orderIdRef.current = savedPaymentState.orderId;
          return;
      }
      
      // Prevent double initialization
      if (initializingRef.current) return;
      initializingRef.current = true;

      try {
        // Get authenticated user ID
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        // Generate a new idempotency key for this attempt
        const idempotencyKey = crypto.randomUUID();

        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: currentAmountCents,
            currency: 'usd',
            user_id: userId, // Pass authenticated user ID
            idempotency_key: idempotencyKey,
            cart_items: checkoutData.items.map(item => ({
              id: item.productId,
              productId: item.productId,
              price: item.price, // Pass price in dollars (database expects DECIMAL(10,2))
              quantity: item.quantity,
              variant: item.variant
            })),
            shipping_address: checkoutData.shippingAddress,
            billing_address: checkoutData.billingAddress,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            customer_email: (checkoutData.billingAddress as any).email || (checkoutData.shippingAddress as any).email
          }),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        setClientSecret(data.data.clientSecret);
        orderIdRef.current = data.data.orderId;

        // Save state to parent/storage
        if (onSavePaymentState) {
            onSavePaymentState({
                clientSecret: data.data.clientSecret,
                orderId: data.data.orderId,
                amount: checkoutData.total
            });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.';
        console.error('Error creating payment intent:', error);
        toast.error(message);
        initializingRef.current = false; // Allow retry on error
      }
    };

    createPaymentIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutData.total, checkoutData.items.length]); // Re-run if total or items change

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements 
      stripe={getStripe()} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <PaymentFormInner
        checkoutData={checkoutData}
        onPaymentSuccess={onPaymentSuccess}
        onBack={onBack}
        clientSecret={clientSecret}
        orderId={orderIdRef.current || ''}
      />
    </Elements>
  );
};

export default CheckoutPaymentForm;
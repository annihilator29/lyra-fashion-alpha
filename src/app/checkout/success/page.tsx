'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/cart-store';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  
  // Clear cart on successful load if coming from Stripe redirect
  useEffect(() => {
    if (paymentIntentClientSecret) {
      useCartStore.getState().clearCart();
    }
  }, [paymentIntentClientSecret]);

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center shadow-lg border-green-100">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been processed successfully.
          </p>
          
          {orderId && (
            <div className="bg-muted/30 p-4 rounded-lg border border-dashed text-sm">
              <span className="text-muted-foreground block mb-1">Order Reference</span>
              <span className="font-mono font-medium text-foreground">{orderId}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address.
            </p>
            
            <Button asChild className="w-full mt-4" size="lg">
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

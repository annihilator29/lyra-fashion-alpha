'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useCheckout } from '@/hooks/use-checkout';
import CheckoutShippingForm from '@/components/shop/checkout-shipping-form';
import CheckoutOrderSummary from '@/components/shop/checkout-order-summary';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define checkout steps
type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutClient() {
  const { items } = useCartStore();
  const { currentStep, nextStep, prevStep, goToStep, checkoutData, updateCheckoutData } = useCheckout();
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  // Check if cart has items
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart'); // Actual redirect to cart
    }
  }, [items, router]);

  // Check screen size for mobile layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle form submission from shipping step
  const handleShippingSubmit = (data: Record<string, unknown>) => {
    updateCheckoutData(data);
    nextStep();
  };

  // Progress indicator component
  const ProgressIndicator = () => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review'];
    const stepLabels = {
      shipping: 'Shipping',
      payment: 'Payment',
      review: 'Review',
    };

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  steps.indexOf(currentStep) >= steps.indexOf(step)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 ${
                  currentStep === step ? 'font-bold text-blue-600' : 'text-gray-500'
                }`}
              >
                {stepLabels[step]}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 ${
                    steps.indexOf(currentStep) > steps.indexOf(step)
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold capitalize">
            {currentStep === 'shipping' && 'Shipping Information'}
            {currentStep === 'payment' && 'Payment Information'}
            {currentStep === 'review' && 'Review Order'}
          </h2>
        </div>
      </div>
    );
  };

  // Navigation buttons
  const NavigationButtons = () => {
    return (
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 'shipping'}
        >
          Back
        </Button>
        {currentStep !== 'review' && (
          <Button
            onClick={nextStep}
            disabled={currentStep === 'payment'} // Payment step is disabled in this story
          >
            {currentStep === 'shipping' ? 'Continue to Review' : 'Continue to Payment'}
          </Button>
        )}
        {currentStep === 'review' && (
          <Button disabled>
            Complete Order (Coming Soon)
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <ProgressIndicator />
      
      <div className={`${isMobile ? 'flex-col' : 'flex gap-8'}`}>
        {/* Form Section */}
        <div className={`${isMobile ? 'order-1 mb-8' : 'w-1/2'}`}>
          {currentStep === 'shipping' && (
            <CheckoutShippingForm 
              onNext={handleShippingSubmit} 
              formData={checkoutData} 
            />
          )}
          
          {currentStep === 'payment' && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              <p className="text-gray-600">
                Payment processing will be available in the next update.
                Your shipping and order information have been saved.
              </p>
              <Button
                className="mt-4"
                onClick={() => goToStep('review')}
                disabled
              >
                Continue to Review
              </Button>
            </div>
          )}
          
          {currentStep === 'review' && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Review Your Order</h3>
              
              {/* Shipping Address Section */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Shipping Address:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToStep('shipping')}
                  >
                    Edit
                  </Button>
                </div>
                <p>{checkoutData?.shipping_name}</p>
                <p>{checkoutData?.shipping_address}</p>
                <p>{checkoutData?.shipping_city}, {checkoutData?.shipping_postal_code}</p>
                <p>{checkoutData?.shipping_country}</p>
              </div>
              
              {/* Billing Address Section */}
              {!checkoutData?.same_as_shipping && checkoutData?.billing_name && (
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Billing Address:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToStep('shipping')}
                    >
                      Edit
                    </Button>
                  </div>
                  <p>{checkoutData?.billing_name}</p>
                  <p>{checkoutData?.billing_address}</p>
                  <p>{checkoutData?.billing_city}, {checkoutData?.billing_postal_code}</p>
                  <p>{checkoutData?.billing_country}</p>
                </div>
              )}
            </div>
          )}
          
          <NavigationButtons />
        </div>
        
        {/* Order Summary Section */}
        <div className={cn(
          isMobile ? 'order-2' : 'w-1/2 sticky top-4'
        )}>
          <CheckoutOrderSummary />
        </div>
      </div>
    </div>
  );
}